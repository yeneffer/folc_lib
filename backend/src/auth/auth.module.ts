import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

/**
 * Modulo de autenticacao base (F0.3). Exporta o AuthService e os guards
 * para que qualquer modulo de dominio os utilize. SupabaseModule e global,
 * entao nao precisa ser reimportado aqui.
 * Os endpoints de cadastro/login serao adicionados em B1.
 */
@Global()
@Module({
  providers: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, SupabaseAuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
