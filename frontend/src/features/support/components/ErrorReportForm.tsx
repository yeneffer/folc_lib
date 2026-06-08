'use client';

import { useState } from 'react';
import { Alert, Button, Field, TextareaField } from '@/components/ui';
import { supportService } from '../services/supportService';

export function ErrorReportForm() {
  const [descricao, setDescricao] = useState('');
  const [url, setUrl] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await supportService.reportError({ descricao, url: url || undefined });
      setSent(true);
    } catch {
      setError('Não foi possível enviar o relato.');
    } finally {
      setLoading(false);
    }
  };

  // Tela "erro relatado"
  if (sent) {
    return (
      <Alert tone="success">
        Erro relatado! Obrigado por ajudar a melhorar a plataforma.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Alert>{error}</Alert>}
      <TextareaField
        label="Descreva o erro"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
      />
      <Field
        label="URL onde ocorreu (opcional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button type="submit" loading={loading}>
        Enviar relato
      </Button>
    </form>
  );
}
