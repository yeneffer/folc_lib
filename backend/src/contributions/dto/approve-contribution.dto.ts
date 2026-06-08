import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ContentType } from '../../common/enums';

/** Ao aprovar, o avaliador define o tipo do conteudo gerado (B4.2). */
export class ApproveContributionDto {
  @IsEnum(ContentType, { message: 'Tipo de conteudo invalido' })
  tipo: ContentType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorias?: string[];
}
