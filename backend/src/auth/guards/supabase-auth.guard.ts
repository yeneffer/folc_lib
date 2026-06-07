import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Exige um JWT valido do Supabase. Anexa o usuario resolvido a
 * `request.user`. Use em rotas que exigem autenticacao.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.auth.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Token de autenticacao ausente');
    }

    const user = await this.auth.resolveUser(token);
    if (!user) {
      throw new UnauthorizedException('Token invalido ou expirado');
    }

    (req as Request & { user?: unknown }).user = user;
    return true;
  }
}
