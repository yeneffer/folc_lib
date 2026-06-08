'use client';

import { RouteGuard } from '@/components/layout/RouteGuard';
import { ClassList } from '@/features/classes';

export default function TurmasPage() {
  return (
    <main className="container page">
      <h1>Minhas turmas</h1>
      <RouteGuard roles={['professor']}>
        <ClassList />
      </RouteGuard>
    </main>
  );
}
