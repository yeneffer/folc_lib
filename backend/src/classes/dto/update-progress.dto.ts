import { IsEnum } from 'class-validator';
import { AssignmentStatus } from '../../common/enums';

export class UpdateProgressDto {
  @IsEnum(AssignmentStatus, { message: 'Status de progresso invalido' })
  status: AssignmentStatus;
}
