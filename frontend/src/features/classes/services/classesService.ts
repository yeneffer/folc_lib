import { api } from '@/lib/apiClient';
import type { Assignment, ClassSummary } from '@/types';

export interface StudentRef {
  id: string;
  nome: string;
}

export interface ClassDetail {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  alunos: StudentRef[];
}

export interface ProgressEntry {
  assignmentId: string;
  assignmentTitulo: string;
  studentId: string;
  studentNome: string;
  status: string;
  completedAt: string | null;
}

export const classesService = {
  list(): Promise<ClassSummary[]> {
    return api.get<ClassSummary[]>('/classes');
  },
  create(nome: string, descricao?: string): Promise<ClassDetail> {
    return api.post<ClassDetail>('/classes', { nome, descricao });
  },
  get(id: string): Promise<ClassDetail> {
    return api.get<ClassDetail>(`/classes/${id}`);
  },
  addStudent(id: string, email: string): Promise<ClassDetail> {
    return api.post<ClassDetail>(`/classes/${id}/students`, { email });
  },
  assignments(id: string): Promise<Assignment[]> {
    return api.get<Assignment[]>(`/classes/${id}/assignments`);
  },
  createAssignment(
    id: string,
    payload: { titulo: string; descricao?: string; contentId?: string; dueDate: string },
  ): Promise<Assignment> {
    return api.post<Assignment>(`/classes/${id}/assignments`, payload);
  },
  progress(id: string): Promise<ProgressEntry[]> {
    return api.get<ProgressEntry[]>(`/classes/${id}/progress`);
  },
};
