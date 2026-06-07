import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/** Alteracao de e-mail e/ou senha da conta (Perfil > Seguranca). */
export class UpdateSecurityDto {
  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres' })
  novaSenha?: string;
}
