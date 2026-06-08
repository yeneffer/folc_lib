import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AssignmentStatus, UserRole } from '../common/enums';
import { AuthenticatedUser } from '../auth/types';
import { ClassesRepository } from './classes.repository';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  Assignment,
  ClassDetail,
  ClassRow,
  ClassSummary,
  HistoryEntry,
  ProgressEntry,
  toAssignment,
} from './entities/class.entity';

@Injectable()
export class ClassesService {
  constructor(private readonly repo: ClassesRepository) {}

  /** Cria turma com codigo unico. */
  async create(professorId: string, dto: CreateClassDto): Promise<ClassDetail> {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const row = await this.repo.insertClass({
          professorId,
          nome: dto.nome,
          codigo: this.genCode(),
          descricao: dto.descricao,
        });
        return this.toDetail(row, []);
      } catch (e) {
        if ((e as { code?: string })?.code === '23505' && attempt < 4) continue;
        throw e;
      }
    }
    throw new Error('Falha ao gerar codigo de turma');
  }

  async listMine(professorId: string): Promise<ClassSummary[]> {
    const rows = await this.repo.listByProfessor(professorId);
    const counts = await this.repo.studentCounts(rows.map((r) => r.id));
    return rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      codigo: r.codigo,
      totalAlunos: counts[r.id] ?? 0,
    }));
  }

  async getDetail(classId: string, user: AuthenticatedUser): Promise<ClassDetail> {
    const turma = await this.requireClass(classId);
    await this.assertOwnerOrMember(turma, user);
    const alunos = await this.repo.listStudents(classId);
    return this.toDetail(turma, alunos);
  }

  async addStudent(
    classId: string,
    professorId: string,
    dto: AddStudentDto,
  ): Promise<ClassDetail> {
    const turma = await this.requireClass(classId);
    this.assertOwner(turma, professorId);

    let studentId = dto.studentId;
    if (!studentId && dto.email) {
      const profile = await this.repo.findProfileByEmail(dto.email);
      if (!profile) throw new NotFoundException('Aluno nao encontrado pelo e-mail');
      studentId = profile.id;
    }
    if (!studentId) {
      throw new NotFoundException('Informe studentId ou email do aluno');
    }

    await this.repo.addStudent(classId, studentId);
    const alunos = await this.repo.listStudents(classId);
    return this.toDetail(turma, alunos);
  }

  async listAssignments(
    classId: string,
    user: AuthenticatedUser,
  ): Promise<Assignment[]> {
    const turma = await this.requireClass(classId);
    await this.assertOwnerOrMember(turma, user);

    const rows = await this.repo.listAssignments(classId);
    // aluno ve o proprio status
    if (turma.professor_id !== user.id) {
      const statuses = await this.repo.progressForStudent(
        rows.map((r) => r.id),
        user.id,
      );
      return rows.map((r) =>
        toAssignment(r, statuses[r.id] ?? AssignmentStatus.Pendente),
      );
    }
    return rows.map((r) => toAssignment(r));
  }

  async createAssignment(
    classId: string,
    professorId: string,
    dto: CreateAssignmentDto,
  ): Promise<Assignment> {
    const turma = await this.requireClass(classId);
    this.assertOwner(turma, professorId);
    const row = await this.repo.insertAssignment({
      classId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      contentId: dto.contentId,
      dueDate: dto.dueDate,
    });
    return toAssignment(row);
  }

  /** Aluno marca o proprio progresso num prazo. */
  async updateProgress(
    assignmentId: string,
    studentId: string,
    dto: UpdateProgressDto,
  ): Promise<{ assignmentId: string; status: AssignmentStatus }> {
    const assignment = await this.repo.findAssignmentById(assignmentId);
    if (!assignment) throw new NotFoundException('Prazo nao encontrado');

    const isMember = await this.repo.isStudentOf(assignment.class_id, studentId);
    if (!isMember) {
      throw new ForbiddenException('Voce nao participa desta turma');
    }

    const completedAt =
      dto.status === AssignmentStatus.Concluido ? new Date().toISOString() : null;
    await this.repo.upsertProgress(assignmentId, studentId, dto.status, completedAt);
    return { assignmentId, status: dto.status };
  }

  /** B5.3 — progresso dos alunos (professor). */
  async classProgress(
    classId: string,
    professorId: string,
  ): Promise<ProgressEntry[]> {
    const turma = await this.requireClass(classId);
    this.assertOwner(turma, professorId);
    return this.repo.progressByClass(classId);
  }

  /** B5.4 — historico de acesso do usuario. */
  history(userId: string, limit = 50): Promise<HistoryEntry[]> {
    return this.repo.historyOf(userId, limit);
  }

  // ----- helpers -----
  private async requireClass(classId: string): Promise<ClassRow> {
    const turma = await this.repo.findClassById(classId);
    if (!turma) throw new NotFoundException('Turma nao encontrada');
    return turma;
  }

  private assertOwner(turma: ClassRow, professorId: string): void {
    if (turma.professor_id !== professorId) {
      throw new ForbiddenException('Apenas o professor da turma pode fazer isso');
    }
  }

  private async assertOwnerOrMember(
    turma: ClassRow,
    user: AuthenticatedUser,
  ): Promise<void> {
    if (turma.professor_id === user.id) return;
    if (user.role === UserRole.Aluno) {
      const member = await this.repo.isStudentOf(turma.id, user.id);
      if (member) return;
    }
    throw new ForbiddenException('Sem acesso a esta turma');
  }

  private toDetail(
    row: ClassRow,
    alunos: { id: string; nome: string }[],
  ): ClassDetail {
    return {
      id: row.id,
      nome: row.nome,
      codigo: row.codigo,
      descricao: row.descricao,
      alunos,
    };
  }

  private genCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
