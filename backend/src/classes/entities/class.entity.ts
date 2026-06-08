import { AssignmentStatus } from '../../common/enums';

export interface StudentRef {
  id: string;
  nome: string;
}

export interface ClassSummary {
  id: string;
  nome: string;
  codigo: string;
  totalAlunos: number;
}

export interface ClassDetail {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  alunos: StudentRef[];
}

export interface Assignment {
  id: string;
  titulo: string;
  descricao: string | null;
  contentId: string | null;
  dueDate: string;
  status?: AssignmentStatus;
}

/** Progresso de um aluno num prazo (visao do professor). */
export interface ProgressEntry {
  assignmentId: string;
  assignmentTitulo: string;
  studentId: string;
  studentNome: string;
  status: AssignmentStatus;
  completedAt: string | null;
}

export interface HistoryEntry {
  contentId: string;
  titulo: string;
  accessedAt: string;
}

// ----- linhas brutas -----
export interface ClassRow {
  id: string;
  professor_id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
}

export interface AssignmentRow {
  id: string;
  class_id: string;
  titulo: string;
  descricao: string | null;
  content_id: string | null;
  due_date: string;
}

export function toAssignment(
  row: AssignmentRow,
  status?: AssignmentStatus,
): Assignment {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    contentId: row.content_id,
    dueDate: row.due_date,
    status,
  };
}
