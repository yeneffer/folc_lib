'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Spinner } from '@/components/ui';
import type { ContentDetail } from '@/types';
import { contentService } from '../services/contentService';
import { MediaView } from './MediaView';
import { RecipeView } from './RecipeView';
import { SaveOfflineButton } from './SaveOfflineButton';

export function ContentView({ id }: { id: string }) {
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    contentService
      .getById(id)
      .then((c) => active && setContent(c))
      .catch(() => active && setError('Conteúdo não encontrado.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !content) return <Alert>{error ?? 'Erro'}</Alert>;

  return (
    <article className="stack">
      <div>
        <div className="row" style={{ marginBottom: '0.5rem' }}>
          <Badge>{content.tipo}</Badge>
          {content.pedagogico && <Badge tone="muted">pedagógico</Badge>}
          {content.categorias.map((c) => (
            <Badge key={c.id} tone="muted">
              {c.nome}
            </Badge>
          ))}
        </div>
        <h1 style={{ margin: '0.25rem 0' }}>{content.titulo}</h1>
        <p className="muted">
          {[content.origemCultural, content.estado, content.evento, content.comunidade]
            .filter(Boolean)
            .join(' · ')}
          {content.autor ? ` — por ${content.autor.nome}` : ''}
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <SaveOfflineButton contentId={content.id} />
        </div>
      </div>

      <MediaView tipo={content.tipo} url={content.mediaUrl} />

      {content.descricao && (
        <Card>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{content.descricao}</p>
        </Card>
      )}

      {content.tipo === 'receita' && <RecipeView metadata={content.metadata} />}
    </article>
  );
}
