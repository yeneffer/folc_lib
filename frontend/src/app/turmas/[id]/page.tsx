'use client';

import { RouteGuard } from '@/components/layout/RouteGuard';
import { ClassDetailView } from '@/features/classes';

export default function TurmaDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container page">
      <RouteGuard roles={['professor']}>
        <ClassDetailView id={params.id} />
      </RouteGuard>
    </main>
  );
}
