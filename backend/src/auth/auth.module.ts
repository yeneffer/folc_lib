import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

/**
 * Modulo de autenticacao (F0.3 base + B1 fluxos). Exporta o AuthService e os
 * guards para que qualquer modulo de dominio os utilize. SupabaseModule e
 * ConfigModule sao globais, entao nao precisam ser reimportados aqui.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
