import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { ProfileRow, toUserProfile, UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /** RF02 — perfil do usuario. */
  async findById(userId: string): Promise<UserProfile> {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Perfil nao encontrado');
    }
    return toUserProfile(data as ProfileRow);
  }

  /** Atualiza nome/avatar do proprio perfil. */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const patch: Record<string, unknown> = {};
    if (dto.nome !== undefined) patch.nome = dto.nome;
    if (dto.avatarUrl !== undefined) patch.avatar_url = dto.avatarUrl;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      this.logger.error(error);
      throw new InternalServerErrorException('Falha ao atualizar o perfil');
    }
    return toUserProfile(data as ProfileRow);
  }

  /** B1.5 — altera e-mail e/ou senha da conta (Auth + profiles). */
  async updateSecurity(
    userId: string,
    dto: UpdateSecurityDto,
  ): Promise<UserProfile> {
    if (!dto.email && !dto.novaSenha) {
      throw new BadRequestException('Informe um novo e-mail ou senha');
    }

    const client = this.supabase.getClient();
    const attrs: { email?: string; password?: string } = {};
    if (dto.email) attrs.email = dto.email;
    if (dto.novaSenha) attrs.password = dto.novaSenha;

    const { error: authError } = await client.auth.admin.updateUserById(
      userId,
      attrs,
    );
    if (authError) {
      this.logger.error(authError);
      throw new InternalServerErrorException('Falha ao atualizar credenciais');
    }

    // mantem o e-mail espelhado em profiles
    if (dto.email) {
      await client.from('profiles').update({ email: dto.email }).eq('id', userId);
    }
    return this.findById(userId);
  }
}
