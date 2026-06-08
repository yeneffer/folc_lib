'use client';

import { useEffect, useState } from 'react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import type { FaqItem } from '@/types';
import { supportService } from '../services/supportService';

export function FaqList() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportService
      .faq()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (items.length === 0) return <EmptyState>Nenhuma pergunta cadastrada.</EmptyState>;

  return (
    <div className="stack">
      {items.map((f) => (
        <Card key={f.id}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              {f.pergunta}
            </summary>
            <p style={{ marginBottom: 0 }}>{f.resposta}</p>
          </details>
        </Card>
      ))}
    </div>
  );
}
