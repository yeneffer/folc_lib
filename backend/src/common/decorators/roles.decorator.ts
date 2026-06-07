import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Restringe a rota aos perfis informados (RBAC).
 * Usado em conjunto com o RolesGuard (F0.3).
 *
 * @example
 *   @Roles(UserRole.Avaliador)
 *   @Get('curation/queue')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
