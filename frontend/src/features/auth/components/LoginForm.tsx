'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field } from '@/components/ui';
import { ApiClientError } from '@/lib/apiClient';
import { useAuth } from '../AuthProvider';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, senha });
      router.push('/acervo');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Entrar</h1>
      {error && <Alert>{error}</Alert>}
      <Field
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      <Button type="submit" loading={loading}>
        Entrar
      </Button>
      <p className="muted" style={{ marginTop: '1rem' }}>
        <Link href="/esqueci-senha">Esqueci minha senha</Link> ·{' '}
        <Link href="/cadastro">Criar conta</Link>
      </p>
    </form>
  );
}
