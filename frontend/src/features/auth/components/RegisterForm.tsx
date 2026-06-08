'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, SelectField } from '@/components/ui';
import { ApiClientError } from '@/lib/apiClient';
import type { UserRole } from '@/types';
import { useAuth } from '../AuthProvider';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'aluno', label: 'Aluno' },
  { value: 'professor', label: 'Professor' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'avaliador', label: 'Avaliador' },
];

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'aluno' as UserRole,
  });
  const [aceiteTermos, setAceite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!aceiteTermos) {
      setError('É necessário aceitar os termos de uso');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, aceiteTermos: true });
      router.push('/acervo');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Falha ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Criar conta</h1>
      {error && <Alert>{error}</Alert>}
      <Field label="Nome" value={form.nome} onChange={set('nome')} required />
      <Field
        label="E-mail"
        type="email"
        value={form.email}
        onChange={set('email')}
        required
      />
      <Field
        label="Senha (mín. 8 caracteres)"
        type="password"
        value={form.senha}
        onChange={set('senha')}
        minLength={8}
        required
      />
      <SelectField label="Tipo de usuário" value={form.role} onChange={set('role')}>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </SelectField>

      <label className="row" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        <input
          type="checkbox"
          checked={aceiteTermos}
          onChange={(e) => setAceite(e.target.checked)}
        />
        Li e aceito os termos de uso e a política de privacidade (LGPD).
      </label>

      <Button type="submit" loading={loading}>
        Cadastrar
      </Button>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </form>
  );
}
