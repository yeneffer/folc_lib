'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import type { ClassSummary } from '@/types';
import { classesService } from '../services/classesService';

export function ClassList() {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    classesService
      .list()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await classesService.create(nome);
      setNome('');
      load();
    } catch {
      setError('Falha ao criar turma.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="stack">
      <Card>
        <form onSubmit={create} className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field
              label="Nova turma"
              placeholder="Nome da turma"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <Button type="submit" loading={creating}>
            Criar
          </Button>
        </form>
        {error && <Alert>{error}</Alert>}
      </Card>

      {loading ? (
        <Spinner />
      ) : classes.length === 0 ? (
        <EmptyState>Você ainda não tem turmas.</EmptyState>
      ) : (
        <div className="grid">
          {classes.map((c) => (
            <Link key={c.id} href={`/turmas/${c.id}`} style={{ textDecoration: 'none' }}>
              <Card>
                <strong>{c.nome}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                  Código {c.codigo} · {c.totalAlunos} aluno(s)
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
