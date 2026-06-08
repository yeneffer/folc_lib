'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import type { Assignment } from '@/types';
import {
  classesService,
  type ClassDetail,
  type ProgressEntry,
} from '../services/classesService';

export function ClassDetailView({ id }: { id: string }) {
  const [turma, setTurma] = useState<ClassDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [novoPrazo, setNovoPrazo] = useState({ titulo: '', dueDate: '' });

  const reload = async () => {
    const [t, a, p] = await Promise.all([
      classesService.get(id),
      classesService.assignments(id),
      classesService.progress(id).catch(() => [] as ProgressEntry[]),
    ]);
    setTurma(t);
    setAssignments(a);
    setProgress(p);
  };

  useEffect(() => {
    reload()
      .catch(() => setError('Não foi possível carregar a turma.'))
      .finally(() => setLoading(false));
  }, [id]);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updated = await classesService.addStudent(id, email);
      setTurma(updated);
      setEmail('');
    } catch {
      setError('Aluno não encontrado para esse e-mail.');
    }
  };

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPrazo.titulo || !novoPrazo.dueDate) return;
    await classesService.createAssignment(id, {
      titulo: novoPrazo.titulo,
      dueDate: new Date(novoPrazo.dueDate).toISOString(),
    });
    setNovoPrazo({ titulo: '', dueDate: '' });
    setAssignments(await classesService.assignments(id));
    setProgress(await classesService.progress(id).catch(() => []));
  };

  if (loading) return <Spinner />;
  if (!turma) return <Alert>{error ?? 'Turma não encontrada.'}</Alert>;

  return (
    <div className="stack">
      <div>
        <h1 style={{ marginBottom: 0 }}>{turma.nome}</h1>
        <p className="muted">Código de acesso: {turma.codigo}</p>
      </div>
      {error && <Alert>{error}</Alert>}

      {/* Alunos */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Alunos ({turma.alunos.length})</h3>
        <form onSubmit={addStudent} className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field
              label="Adicionar aluno por e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit">Adicionar</Button>
        </form>
        {turma.alunos.length === 0 ? (
          <EmptyState>Nenhum aluno ainda.</EmptyState>
        ) : (
          <ul>
            {turma.alunos.map((a) => (
              <li key={a.id}>{a.nome}</li>
            ))}
          </ul>
        )}
      </Card>

      {/* Prazos */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Prazos</h3>
        <form onSubmit={addAssignment} className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field
              label="Título do prazo"
              value={novoPrazo.titulo}
              onChange={(e) => setNovoPrazo((p) => ({ ...p, titulo: e.target.value }))}
            />
          </div>
          <div>
            <Field
              label="Data"
              type="date"
              value={novoPrazo.dueDate}
              onChange={(e) => setNovoPrazo((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>
          <Button type="submit">Criar prazo</Button>
        </form>
        {assignments.length === 0 ? (
          <EmptyState>Nenhum prazo cadastrado.</EmptyState>
        ) : (
          <ul>
            {assignments.map((a) => (
              <li key={a.id}>
                {a.titulo} — {new Date(a.dueDate).toLocaleDateString('pt-BR')}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Progresso */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Progresso dos alunos</h3>
        {progress.length === 0 ? (
          <EmptyState>Sem registros de progresso ainda.</EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Prazo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p, i) => (
                <tr key={i}>
                  <td>{p.studentNome}</td>
                  <td>{p.assignmentTitulo}</td>
                  <td>
                    <Badge tone={p.status === 'concluido' ? 'success' : 'muted'}>
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
