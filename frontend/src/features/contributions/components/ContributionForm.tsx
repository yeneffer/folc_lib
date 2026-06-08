'use client';

import { useState } from 'react';
import { Alert, Button, Field, TextareaField } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { ApiClientError } from '@/lib/apiClient';
import { contributionsService } from '../services/contributionsService';

export function ContributionForm() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeContato, setNomeContato] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [aceite, setAceite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!aceite) return setError('É necessário aceitar os termos de contribuição.');
    if (files.length === 0) return setError('Anexe ao menos um arquivo.');

    setLoading(true);
    try {
      const arquivos = await Promise.all(
        files.map((f) => contributionsService.uploadFile(f)),
      );
      await contributionsService.create({
        titulo,
        descricao,
        arquivos,
        nomeContato: user ? undefined : nomeContato || undefined,
        emailContato: user ? undefined : emailContato || undefined,
        aceiteTermos: true,
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao enviar a contribuição.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Tela "colab enviada"
  if (sent) {
    return (
      <Alert tone="success">
        Contribuição enviada! Ela passará pela curadoria antes de ser publicada.
        Obrigado por enriquecer o acervo.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Alert>{error}</Alert>}
      <Field label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <TextareaField
        label="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
      />

      {!user && (
        <>
          <Field
            label="Seu nome (contato)"
            value={nomeContato}
            onChange={(e) => setNomeContato(e.target.value)}
          />
          <Field
            label="Seu e-mail (contato)"
            type="email"
            value={emailContato}
            onChange={(e) => setEmailContato(e.target.value)}
          />
        </>
      )}

      <div className="field">
        <label>Arquivos (imagens, vídeo, áudio, PDF…)</label>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <span className="muted">{files.length} arquivo(s) selecionado(s)</span>
        )}
      </div>

      <label className="row" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
        Declaro que tenho direito de compartilhar este conteúdo e aceito os
        termos de contribuição.
      </label>

      <Button type="submit" loading={loading}>
        Enviar contribuição
      </Button>
    </form>
  );
}
