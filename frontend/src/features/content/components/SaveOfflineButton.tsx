'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { offlineService } from '../services/contentService';

/** RF06 — marca/desmarca conteudo para offline (somente logado). */
export function SaveOfflineButton({ contentId }: { contentId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await offlineService.unmark(contentId);
        setSaved(false);
      } else {
        await offlineService.mark(contentId);
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={toggle} loading={loading}>
      {saved ? '✓ Salvo offline' : 'Salvar offline'}
    </Button>
  );
}
