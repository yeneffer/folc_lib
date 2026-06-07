import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enums';
import { AuthenticatedUser } from '../types';
import { RolesGuard } from './roles.guard';

function makeContext(user?: Partial<AuthenticatedUser>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard (RBAC)', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('libera a rota quando nao ha @Roles definido', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(makeContext({ role: UserRole.Aluno }))).toBe(true);
  });

  it('libera quando o perfil do usuario esta autorizado', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.Avaliador]);
    expect(
      guard.canActivate(makeContext({ role: UserRole.Avaliador })),
    ).toBe(true);
  });

  it('bloqueia (403) quando o perfil nao esta autorizado', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.Avaliador]);
    expect(() =>
      guard.canActivate(makeContext({ role: UserRole.Aluno })),
    ).toThrow(ForbiddenException);
  });

  it('bloqueia (403) quando nao ha usuario autenticado', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.Professor]);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
