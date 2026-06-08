import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AssignmentStatus, UserRole } from '../common/enums';
import { AuthenticatedUser } from '../auth/types';
import { ClassesRepository } from './classes.repository';
import { ClassesService } from './classes.service';
import { ClassRow } from './entities/class.entity';

const PROF: AuthenticatedUser = { id: 'prof-1', email: 'p@x', role: UserRole.Professor };
const ALUNO: AuthenticatedUser = { id: 'aluno-1', email: 'a@x', role: UserRole.Aluno };

function turma(overrides: Partial<ClassRow> = {}): ClassRow {
  return {
    id: 'turma-1',
    professor_id: 'prof-1',
    nome: 'Turma A',
    codigo: 'ABC123',
    descricao: null,
    ...overrides,
  };
}

describe('ClassesService', () => {
  let repo: jest.Mocked<ClassesRepository>;
  let service: ClassesService;

  beforeEach(() => {
    repo = {
      insertClass: jest.fn(),
      findClassById: jest.fn(),
      listByProfessor: jest.fn(),
      studentCounts: jest.fn().mockResolvedValue({}),
      findProfileByEmail: jest.fn(),
      isStudentOf: jest.fn(),
      addStudent: jest.fn(),
      listStudents: jest.fn().mockResolvedValue([]),
      insertAssignment: jest.fn(),
      listAssignments: jest.fn(),
      findAssignmentById: jest.fn(),
      progressForStudent: jest.fn().mockResolvedValue({}),
      upsertProgress: jest.fn(),
      progressByClass: jest.fn(),
      historyOf: jest.fn(),
    } as unknown as jest.Mocked<ClassesRepository>;
    service = new ClassesService(repo);
  });

  it('cria turma com codigo gerado', async () => {
    repo.insertClass.mockResolvedValue(turma());
    const res = await service.create('prof-1', { nome: 'Turma A' });
    expect(res.codigo).toBeDefined();
    expect(repo.insertClass).toHaveBeenCalled();
  });

  it('detalhe da turma proibido para aluno nao membro', async () => {
    repo.findClassById.mockResolvedValue(turma());
    repo.isStudentOf.mockResolvedValue(false);
    await expect(service.getDetail('turma-1', ALUNO)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('detalhe da turma permitido ao aluno membro', async () => {
    repo.findClassById.mockResolvedValue(turma());
    repo.isStudentOf.mockResolvedValue(true);
    const res = await service.getDetail('turma-1', ALUNO);
    expect(res.id).toBe('turma-1');
  });

  it('addStudent proibido para quem nao e o professor dono', async () => {
    repo.findClassById.mockResolvedValue(turma({ professor_id: 'outro' }));
    await expect(
      service.addStudent('turma-1', 'prof-1', { studentId: '11111111-1111-1111-1111-111111111111' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updateProgress define completedAt ao concluir', async () => {
    repo.findAssignmentById.mockResolvedValue({
      id: 'a-1',
      class_id: 'turma-1',
      titulo: 'Prazo',
      descricao: null,
      content_id: null,
      due_date: '2026-01-01T00:00:00Z',
    });
    repo.isStudentOf.mockResolvedValue(true);
    await service.updateProgress('a-1', 'aluno-1', { status: AssignmentStatus.Concluido });
    expect(repo.upsertProgress).toHaveBeenCalledWith(
      'a-1',
      'aluno-1',
      AssignmentStatus.Concluido,
      expect.any(String),
    );
  });

  it('updateProgress proibido para nao membro', async () => {
    repo.findAssignmentById.mockResolvedValue({
      id: 'a-1',
      class_id: 'turma-1',
      titulo: 'Prazo',
      descricao: null,
      content_id: null,
      due_date: '2026-01-01T00:00:00Z',
    });
    repo.isStudentOf.mockResolvedValue(false);
    await expect(
      service.updateProgress('a-1', 'aluno-1', { status: AssignmentStatus.Concluido }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('classProgress exige ser o professor dono', async () => {
    repo.findClassById.mockResolvedValue(turma({ professor_id: 'outro' }));
    await expect(service.classProgress('turma-1', 'prof-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('404 para turma inexistente', async () => {
    repo.findClassById.mockResolvedValue(null);
    await expect(service.getDetail('x', PROF)).rejects.toBeInstanceOf(NotFoundException);
  });
});
