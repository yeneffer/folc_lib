import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Query base de paginacao/ordenacao — ver CONTRATOS-API.md#convencoes-de-listagem */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  /** Busca textual opcional (?q=). */
  @IsOptional()
  @IsString()
  q?: string;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
