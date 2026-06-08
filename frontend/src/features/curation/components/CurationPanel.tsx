'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Button, Card, EmptyState, Spinner, TextareaField } from '@/components/ui';
import type { ContentSummary, CurationDecision } from '@/types';
import { curationService } from '../services/curationService';

export function CurationPanel() {
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    curationService
      .queue()
      .then((p) => setItems(p.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const decide = async (id: string, decisao: CurationDecision) => {
    setBusy(id);
    setFeedback(null);
    try {
      const res = await curationService.review(id, decisao, comentarios[id]);
      if (res.bloqueadoPorSensibilidade) {
        setFeedback(
          `Publicação bloqueada automaticamente (termos sensíveis: ${res.termosSensiveis.join(', ')}).`,
        );
      }
      setItems((list) => list.filter((c) => c.id !== id));
    } catch {
      setFeedback('Falha ao registrar a decisão.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="stack">
      {feedback && <Alert tone="error">{feedback}</Alert>}
      {items.length === 0 ? (
        <EmptyState>Nenhum conteúdo aguardando avaliação.</EmptyState>
      ) : (
        items.map((c) => (
          <Card key={c.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <Badge>{c.tipo}</Badge>{' '}
                <Link href={`/conteudo/${c.id}`}>{c.titulo}</Link>
              </div>
            </div>
            <TextareaField
              label="Comentário (opcional)"
              value={comentarios[c.id] ?? ''}
              onChange={(e) =>
                setComentarios((m) => ({ ...m, [c.id]: e.target.value }))
              }
            />
            <div className="row">
              <Button
                onClick={() => decide(c.id, 'aprovado')}
                loading={busy === c.id}
              >
                Aprovar
              </Button>
              <Button
                variant="secondary"
                onClick={() => decide(c.id, 'ajustes_solicitados')}
                loading={busy === c.id}
              >
                Solicitar ajustes
              </Button>
              <Button
                variant="danger"
                onClick={() => decide(c.id, 'rejeitado')}
                loading={busy === c.id}
              >
                Rejeitar
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
