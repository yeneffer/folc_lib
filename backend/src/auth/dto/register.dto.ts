import {
  Equals,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome e obrigatorio' })
  nome: string;

  @IsEmail({}, { message: 'E-mail invalido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres' })
  senha: string;

  @IsEnum(UserRole, { message: 'Perfil de usuario invalido' })
  role: UserRole;

  @Equals(true, { message: 'E necessario aceitar os termos de uso' })
  aceiteTermos: boolean;
}
