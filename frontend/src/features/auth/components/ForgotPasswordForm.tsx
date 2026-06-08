'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button, Field } from '@/components/ui';
import { authService } from '../services/authService';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  // Tela "Email enviado"
  if (sent) {
    return (
      <div>
        <h1>E-mail enviado</h1>
        <Alert tone="success">
          Se houver uma conta para <strong>{email}</strong>, enviamos um link
          para redefinir a senha.
        </Alert>
        <Link href="/login">Voltar para o login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Esqueci minha senha</h1>
      <p className="muted">Enviaremos um link de redefinição para o seu e-mail.</p>
      <Field
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" loading={loading}>
        Enviar link
      </Button>
      <p className="muted" style={{ marginTop: '1rem' }}>
        <Link href="/login">Voltar</Link>
      </p>
    </form>
  );
}
