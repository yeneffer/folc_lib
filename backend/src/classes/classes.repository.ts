import { Injectable } from '@nestjs/common';
import { AssignmentStatus } from '../common/enums';
import { SupabaseService } from '../supabase/supabase.service';
import {
  AssignmentRow,
  ClassRow,
  HistoryEntry,
  ProgressEntry,
  StudentRef,
} from './entities/class.entity';

@Injectable()
export class ClassesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  // ----- classes -----
  async insertClass(values: {
    professorId: string;
    nome: string;
    codigo: string;
    descricao?: string;
  }): Promise<ClassRow> {
    const { data, error } = await this.db
      .from('classes')
      .insert({
        professor_id: values.professorId,
        nome: values.nome,
        codigo: values.codigo,
        descricao: values.descricao ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as ClassRow;
  }

  async findClassById(id: string): Promise<ClassRow | null> {
    const { data } = await this.db
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return (data as ClassRow) ?? null;
  }

  async listByProfessor(professorId: string): Promise<ClassRow[]> {
    const { data, error } = await this.db
      .from('classes')
      .select('*')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ClassRow[];
  }

  async studentCounts(classIds: string[]): Promise<Record<string, number>> {
    if (classIds.length === 0) return {};
    const { data } = await this.db
      .from('class_students')
      .select('class_id')
      .in('class_id', classIds);
    const counts: Record<string, number> = {};
    for (const r of (data ?? []) as { class_id: string }[]) {
      counts[r.class_id] = (counts[r.class_id] ?? 0) + 1;
    }
    return counts;
  }

  // ----- students -----
  async findProfileByEmail(email: string): Promise<StudentRef | null> {
    const { data } = await this.db
      .from('profiles')
      .select('id, nome')
      .eq('email', email)
      .maybeSingle();
    return (data as StudentRef) ?? null;
  }

  async isStudentOf(classId: string, studentId: string): Promise<boolean> {
    const { data } = await this.db
      .from('class_students')
      .select('student_id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .maybeSingle();
    return !!data;
  }

  async addStudent(classId: string, studentId: string): Promise<void> {
    const { error } = await this.db
      .from('class_students')
      .insert({ class_id: classId, student_id: studentId });
    if (error && error.code !== '23505') throw error; // ignora duplicado
  }

  async listStudents(classId: string): Promise<StudentRef[]> {
    const { data } = await this.db
      .from('class_students')
      .select('profiles(id, nome)')
      .eq('class_id', classId);
    return ((data ?? []) as unknown as Array<{ profiles: StudentRef | StudentRef[] | null }>)
      .flatMap((r) => (Array.isArray(r.profiles) ? r.profiles : r.profiles ? [r.profiles] : []));
  }

  // ----- assignments -----
  async insertAssignment(values: {
    classId: string;
    titulo: string;
    descricao?: string;
    contentId?: string;
    dueDate: string;
  }): Promise<AssignmentRow> {
    const { data, error } = await this.db
      .from('assignments')
      .insert({
        class_id: values.classId,
        titulo: values.titulo,
        descricao: values.descricao ?? null,
        content_id: values.contentId ?? null,
        due_date: values.dueDate,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as AssignmentRow;
  }

  async listAssignments(classId: string): Promise<AssignmentRow[]> {
    const { data, error } = await this.db
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data ?? []) as AssignmentRow[];
  }

  async findAssignmentById(id: string): Promise<AssignmentRow | null> {
    const { data } = await this.db
      .from('assignments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return (data as AssignmentRow) ?? null;
  }

  /** Status de progresso de um aluno para uma lista de prazos. */
  async progressForStudent(
    assignmentIds: string[],
    studentId: string,
  ): Promise<Record<string, AssignmentStatus>> {
    if (assignmentIds.length === 0) return {};
    const { data } = await this.db
      .from('assignment_progress')
      .select('assignment_id, status')
      .eq('student_id', studentId)
      .in('assignment_id', assignmentIds);
    const map: Record<string, AssignmentStatus> = {};
    for (const r of (data ?? []) as { assignment_id: string; status: AssignmentStatus }[]) {
      map[r.assignment_id] = r.status;
    }
    return map;
  }

  async upsertProgress(
    assignmentId: string,
    studentId: string,
    status: AssignmentStatus,
    completedAt: string | null,
  ): Promise<void> {
    const { error } = await this.db
      .from('assignment_progress')
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          status,
          completed_at: completedAt,
        },
        { onConflict: 'assignment_id,student_id' },
      );
    if (error) throw error;
  }

  /** B5.3 — progresso de todos os alunos da turma. */
  async progressByClass(classId: string): Promise<ProgressEntry[]> {
    const { data } = await this.db
      .from('assignment_progress')
      .select(
        'status, completed_at, assignments!inner(id, titulo, class_id), profiles!inner(id, nome)',
      )
      .eq('assignments.class_id', classId);

    type Row = {
      status: AssignmentStatus;
      completed_at: string | null;
      assignments: { id: string; titulo: string };
      profiles: { id: string; nome: string };
    };
    return ((data ?? []) as unknown as Row[]).map((r) => ({
      assignmentId: r.assignments.id,
      assignmentTitulo: r.assignments.titulo,
      studentId: r.profiles.id,
      studentNome: r.profiles.nome,
      status: r.status,
      completedAt: r.completed_at,
    }));
  }

  // ----- history (B5.4) -----
  async historyOf(userId: string, limit: number): Promise<HistoryEntry[]> {
    const { data } = await this.db
      .from('content_access_history')
      .select('accessed_at, contents!inner(id, titulo)')
      .eq('user_id', userId)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    type Row = { accessed_at: string; contents: { id: string; titulo: string } };
    return ((data ?? []) as unknown as Row[]).map((r) => ({
      contentId: r.contents.id,
      titulo: r.contents.titulo,
      accessedAt: r.accessed_at,
    }));
  }
}
