import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { AuthenticatedUser } from '../types';

/**
 * RBAC: garante que `request.user.role` esteja entre os perfis exigidos
 * por `@Roles(...)`. Deve rodar apos o SupabaseAuthGuard.
 * Rotas sem `@Roles` passam livremente.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Acesso restrito: autenticacao necessaria');
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException('Permissao insuficiente para este recurso');
    }
    return true;
  }
}
