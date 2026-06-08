'use client';

import { useEffect, useState } from 'react';
import { EmptyState, Spinner } from '@/components/ui';
import { RouteGuard } from '@/components/layout/RouteGuard';
import { ContentCard } from '@/features/acervo/components/ContentCard';
import { offlineService } from '@/features/content';
import type { ContentSummary } from '@/types';

function OfflineList() {
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offlineService
      .list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (items.length === 0) return <EmptyState>Você ainda não salvou conteúdos.</EmptyState>;

  return (
    <div className="grid">
      {items.map((c) => (
        <ContentCard key={c.id} content={c} />
      ))}
    </div>
  );
}

export default function OfflinePage() {
  return (
    <main className="container page">
      <h1>Salvos para offline</h1>
      <RouteGuard>
        <OfflineList />
      </RouteGuard>
    </main>
  );
}
