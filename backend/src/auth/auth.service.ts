import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../common/enums';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedUser } from './types';

/**
 * Servico de autenticacao base: valida o JWT do Supabase e resolve o
 * perfil (role) do usuario a partir da tabela `profiles`.
 * Usado pelos guards (F0.3). Fluxos de login/cadastro entram em B1.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /** Extrai o token do header `Authorization: Bearer <token>`. */
  extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }

  /**
   * Valida o token contra o Supabase Auth e carrega o perfil.
   * Retorna `null` quando o token e invalido/ausente (decisao de lancar
   * erro fica com o guard).
   */
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
}
