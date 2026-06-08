import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty({ message: 'O titulo do prazo e obrigatorio' })
  @MaxLength(160)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'contentId invalido' })
  contentId?: string;

  @IsDateString({}, { message: 'dueDate deve ser uma data ISO valida' })
  dueDate: string;
}
