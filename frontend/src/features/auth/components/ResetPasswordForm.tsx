'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field } from '@/components/ui';
import { ApiClientError } from '@/lib/apiClient';
import { authService } from '../services/authService';

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  // o token de recuperacao chega pelo link do e-mail (?access_token=...)
  const accessToken = params.get('access_token') ?? params.get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessToken) {
      setError('Link de recuperação inválido ou expirado.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(accessToken, novaSenha);
      setDone(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Falha ao redefinir');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div>
        <h1>Senha redefinida</h1>
        <Alert tone="success">Pronto! Redirecionando para o login…</Alert>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Redefinir senha</h1>
      {error && <Alert>{error}</Alert>}
      <Field
        label="Nova senha (mín. 8 caracteres)"
        type="password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        minLength={8}
        required
      />
      <Button type="submit" loading={loading}>
        Salvar nova senha
      </Button>
      <p className="muted" style={{ marginTop: '1rem' }}>
        <Link href="/login">Voltar</Link>
      </p>
    </form>
  );
}
