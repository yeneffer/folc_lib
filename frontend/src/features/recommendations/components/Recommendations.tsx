'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui';
import { ContentCard } from '@/features/acervo/components/ContentCard';
import type { ContentSummary } from '@/types';
import { recommendationsService } from '../services/recommendationsService';

/** RF07 — seção de recomendados (por histórico ou populares). */
export function Recommendations() {
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendationsService
      .list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2>Recomendados para você</h2>
      <div className="grid">
        {items.map((c) => (
          <ContentCard key={c.id} content={c} />
        ))}
      </div>
    </section>
  );
}
