'use client';

import { RouteGuard } from '@/components/layout/RouteGuard';
import { CurationPanel } from '@/features/curation';

export default function CuradoriaPage() {
  return (
    <main className="container page">
      <h1>Curadoria</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        Avalie os conteúdos enviados ao acervo.
      </p>
      <RouteGuard roles={['avaliador']}>
        <CurationPanel />
      </RouteGuard>
    </main>
  );
}
