import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateErrorReportDto {
  @IsString()
  @IsNotEmpty({ message: 'Descreva o erro encontrado' })
  @MaxLength(2000)
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;
}
