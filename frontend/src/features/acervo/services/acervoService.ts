import { api, type Page } from '@/lib/apiClient';
import type { AcervoQuery, Category, ContentSummary } from '@/types';

export const acervoService = {
  list(query: AcervoQuery): Promise<Page<ContentSummary>> {
    return api.getPage<ContentSummary>('/contents', {
      query: query as Record<string, unknown>,
      auth: false,
    });
  },

  categories(): Promise<Category[]> {
    return api.get<Category[]>('/categories', { auth: false });
  },
};
