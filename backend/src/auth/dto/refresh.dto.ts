import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'O refresh token e obrigatorio' })
  refreshToken: string;
}
