import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ContentType } from '../../common/enums';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty({ message: 'O titulo e obrigatorio' })
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(ContentType, { message: 'Tipo de conteudo invalido' })
  tipo: ContentType;

  @IsOptional()
  @IsString()
  origemCultural?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  evento?: string;

  @IsOptional()
  @IsString()
  comunidade?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ano?: number;

  @IsOptional()
  @IsUrl({}, { message: 'mediaUrl deve ser uma URL valida' })
  mediaUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'thumbUrl deve ser uma URL valida' })
  thumbUrl?: string;

  @IsOptional()
  @IsBoolean()
  pedagogico?: boolean;

  /** Receita (B2.5): { ingredientes: string[], modoPreparo: string }. */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  /** Slugs das categorias a associar. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorias?: string[];
}
