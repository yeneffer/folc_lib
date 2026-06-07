import { Request } from 'express';
import { AuthService } from './auth.service';

function reqWith(authorization?: string): Request {
  return { headers: authorization ? { authorization } : {} } as Request;
}

describe('AuthService.extractToken', () => {
  // extractToken nao usa as dependencias; instancia com stubs.
  const service = new AuthService({} as never, {} as never);

  it('extrai o token de um header Bearer valido', () => {
    expect(service.extractToken(reqWith('Bearer abc.def.ghi'))).toBe(
      'abc.def.ghi',
    );
  });

  it('retorna null sem header Authorization', () => {
    expect(service.extractToken(reqWith())).toBeNull();
  });

  it('retorna null para esquema diferente de Bearer', () => {
    expect(service.extractToken(reqWith('Basic abc'))).toBeNull();
  });

  it('retorna null para header Bearer sem token', () => {
    expect(service.extractToken(reqWith('Bearer'))).toBeNull();
  });
});
