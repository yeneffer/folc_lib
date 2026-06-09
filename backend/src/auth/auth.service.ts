import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Session } from '@supabase/supabase-js';
import { Request } from 'express';
import { UserRole } from '../common/enums';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ProfileRow,
  toUserProfile,
  UserProfile,
} from '../users/entities/user-profile.entity';
import { TERMS_VERSION } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, AuthResponse } from './types';

/**
 * Servico de autenticacao (F0.3 base + B1 fluxos). Usa o Supabase Auth
 * (service role) para criar/validar usuarios e a tabela `profiles` para os
 * dados de perfil/RBAC.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Base (usado pelos guards)
  // ---------------------------------------------------------------------------

  /** Extrai o token do header `Authorization: Bearer <token>`. */
  extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }

  /** Valida o token contra o Supabase Auth e carrega o perfil (role). */
  async resolveUser(token: string): Promise<AuthenticatedUser | null> {
    const client = this.supabase.getClient();

    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      this.logger.warn(`Usuario ${data.user.id} sem perfil em profiles`);
      return null;
    }

    return {
      id: profile.id as string,
      email: profile.email as string,
      role: profile.role as UserRole,
    };
  }

  // ---------------------------------------------------------------------------
  // B1 — fluxos de cadastro/login/sessao
  // ---------------------------------------------------------------------------

  /** RF01 — cadastro com aceite de termos. */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const client = this.supabase.getClient();

    // 1. cria o usuario no Auth (ja confirmado, sem etapa de e-mail)
    const { data: created, error: createError } =
      await client.auth.admin.createUser({
        email: dto.email,
        password: dto.senha,
        email_confirm: true,
        user_metadata: { nome: dto.nome, role: dto.role },
      });

    if (createError || !created?.user) {
      if (createError?.status === 422 || /already/i.test(createError?.message ?? '')) {
        throw new ConflictException('E-mail ja cadastrado');
      }
      this.logger.error(createError);
      throw new InternalServerErrorException('Falha ao criar usuario');
    }

    const userId = created.user.id;

    // 2. cria o perfil
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .insert({ id: userId, nome: dto.nome, email: dto.email, role: dto.role })
      .select('*')
      .single();

    if (profileError || !profile) {
      // rollback do usuario para nao deixar Auth orfao
      await client.auth.admin.deleteUser(userId).catch(() => undefined);
      this.logger.error(profileError);
      throw new InternalServerErrorException('Falha ao criar perfil');
    }

    // 3. registra o aceite dos termos (NF05 / LGPD)
    await client
      .from('terms_acceptances')
      .insert({ user_id: userId, terms_version: TERMS_VERSION });

    // 4. gera a sessao
    const session = await this.signIn(dto.email, dto.senha);
    return this.buildAuthResponse(toUserProfile(profile as ProfileRow), session);
  }

  /** RF01 — login. */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const client = this.supabase.getClient();
    const session = await this.signIn(dto.email, dto.senha);

    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      throw new UnauthorizedException('Perfil nao encontrado');
    }
    return this.buildAuthResponse(toUserProfile(profile as ProfileRow), session);
  }

  /** Renova a sessao a partir do refresh token. */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    // refresh no client isolado (grava sessao); DB no client service_role
    const { data, error } = await this.supabase
      .getAuthClient()
      .auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data?.session || !data.user) {
      throw new UnauthorizedException('Refresh token invalido ou expirado');
    }

    const { data: profile, error: profileError } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      throw new UnauthorizedException('Perfil nao encontrado');
    }
    return this.buildAuthResponse(
      toUserProfile(profile as ProfileRow),
      data.session,
    );
  }

  /** Encerra a sessao (revoga o token no Auth). */
  async logout(token: string): Promise<void> {
    const client = this.supabase.getClient();
    await client.auth.admin.signOut(token).catch(() => undefined);
  }

  /** B1.3 — envia e-mail de redefinicao de senha. */
  async forgotPassword(email: string): Promise<void> {
    const client = this.supabase.getClient();
    const redirectTo = this.config.get<string>('FRONTEND_RESET_URL');
    await client.auth
      .resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
      .catch((e) => this.logger.warn(e));
    // sempre 204: nao revelar se o e-mail existe (LGPD/enumeration)
  }

  /** B1.3 — define nova senha a partir do token de recuperacao. */
  async resetPassword(accessToken: string, novaSenha: string): Promise<void> {
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data?.user) {
      throw new UnauthorizedException('Token de recuperacao invalido ou expirado');
    }
    const { error: updateError } = await client.auth.admin.updateUserById(
      data.user.id,
      { password: novaSenha },
    );
    if (updateError) {
      this.logger.error(updateError);
      throw new InternalServerErrorException('Falha ao redefinir a senha');
    }
  }

  // ---------------------------------------------------------------------------
  // helpers internos
  // ---------------------------------------------------------------------------

  private async signIn(email: string, senha: string): Promise<Session> {
    // client isolado: nao poluir o client service_role com a sessao do usuario
    const { data, error } = await this.supabase
      .getAuthClient()
      .auth.signInWithPassword({ email, password: senha });
    if (error || !data?.session) {
      throw new UnauthorizedException('Credenciais invalidas');
    }
    return data.session;
  }

  private buildAuthResponse(
    user: UserProfile,
    session: Session,
  ): AuthResponse {
    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
    };
  }
}
