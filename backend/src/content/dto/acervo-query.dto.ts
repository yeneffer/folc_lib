import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContentType } from '../../common/enums';

/** Normaliza `?x=a&x=b` ou `?x=a` numa lista. */
const toArray = ({ value }: { value: unknown }): unknown =>
  value === undefined ? value : Array.isArray(value) ? value : [value];

/** Filtros do acervo (RF08) — query de GET /contents. */
export class AcervoQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsEnum(ContentType, { each: true })
  tipo?: ContentType[];

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  categoria?: string[]; // slugs

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
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  pedagogico?: boolean;
}
