import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-mail invalido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha e obrigatoria' })
  senha: string;
}
