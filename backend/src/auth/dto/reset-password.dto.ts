import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  /** Token de recuperacao recebido por e-mail (access_token do link). */
  @IsString()
  @IsNotEmpty({ message: 'Token de recuperacao ausente' })
  accessToken: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres' })
  novaSenha: string;
}
