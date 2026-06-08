'use client';

import { Alert, Button, EmptyState, Spinner } from '@/components/ui';
import { useAcervo } from '../hooks/useAcervo';
import { AcervoFilters } from './AcervoFilters';
import { ContentCard } from './ContentCard';

export function AcervoList() {
  const {
    items,
    loading,
    error,
    filters,
    categories,
    updateFilters,
    page,
    setPage,
    totalPages,
  } = useAcervo();

  return (
    <div className="stack">
      <AcervoFilters filters={filters} categories={categories} onChange={updateFilters} />

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState>Nenhum conteúdo encontrado com esses filtros.</EmptyState>
      ) : (
        <div className="grid">
          {items.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center' }}>
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="muted">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
