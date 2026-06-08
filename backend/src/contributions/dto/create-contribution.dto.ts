import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  Equals,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ContributionFileDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsUrl({}, { message: 'URL de arquivo invalida' })
  url: string;
}

export class CreateContributionDto {
  @IsString()
  @IsNotEmpty({ message: 'O titulo e obrigatorio' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'A descricao e obrigatoria' })
  descricao: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Anexe ao menos um arquivo' })
  @ValidateNested({ each: true })
  @Type(() => ContributionFileDto)
  arquivos: ContributionFileDto[];

  /** Dados de contato para visitantes (sem conta). */
  @IsOptional()
  @IsString()
  nomeContato?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail de contato invalido' })
  emailContato?: string;

  @Equals(true, { message: 'E necessario aceitar os termos de contribuicao' })
  aceiteTermos: boolean;
}
