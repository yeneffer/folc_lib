import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Autenticacao opcional: se houver um token valido, anexa `request.user`;
 * caso contrario, segue como visitante (nao lanca erro).
 * Usado em rotas de acesso publico que se comportam diferente quando logado
 * (ex.: GET /contents/:id registra historico; POST /contributions de visitante).
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.auth.extractToken(req);
    if (token) {
      const user = await this.auth.resolveUser(token);
      if (user) {
        (req as Request & { user?: unknown }).user = user;
      }
    }
    return true;
  }
}
