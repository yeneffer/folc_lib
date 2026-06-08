import { IsEmail, IsOptional, IsUUID } from 'class-validator';

/** Adiciona aluno por id OU por e-mail (ao menos um). */
export class AddStudentDto {
  @IsOptional()
  @IsUUID('4', { message: 'studentId invalido' })
  studentId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalido' })
  email?: string;
}
