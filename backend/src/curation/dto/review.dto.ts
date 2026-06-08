import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurationDecision } from '../../common/enums';

export class ReviewDto {
  @IsEnum(CurationDecision, { message: 'Decisao de curadoria invalida' })
  decisao: CurationDecision;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;
}
