'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PaginationMeta } from '@/types';
import type { AcervoQuery, Category, ContentSummary } from '@/types';
import { acervoService } from '../services/acervoService';

const LIMIT = 12;

export function useAcervo() {
  const [filters, setFilters] = useState<AcervoQuery>({});
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    acervoService.categories().then(setCategories).catch(() => undefined);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await acervoService.list({ ...filters, page, limit: LIMIT });
      setItems(res.items);
      setMeta(res.meta);
    } catch {
      setError('Não foi possível carregar o acervo.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Atualiza filtros e volta para a primeira pagina. */
  const updateFilters = (patch: Partial<AcervoQuery>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return {
    items,
    meta,
    categories,
    loading,
    error,
    filters,
    updateFilters,
    page,
    setPage,
    totalPages,
  };
}
