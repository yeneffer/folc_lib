import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

type BadgeTone = 'default' | 'success' | 'danger' | 'muted';

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const cls = tone === 'default' ? 'badge' : `badge badge-${tone}`;
  return <span className={cls}>{children}</span>;
}

export function Alert({
  children,
  tone = 'error',
}: {
  children: ReactNode;
  tone?: 'error' | 'success';
}) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}

export function Spinner() {
  return (
    <div className="row" role="status" aria-label="Carregando">
      <span className="spinner" />
      <span className="muted">Carregando…</span>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="muted" style={{ padding: '1rem 0' }}>{children}</p>;
}
