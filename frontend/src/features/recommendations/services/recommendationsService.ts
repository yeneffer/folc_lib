import { api } from '@/lib/apiClient';
import type { ContentSummary } from '@/types';

export const recommendationsService = {
  // auth opcional: envia o Bearer se houver (personaliza por historico)
  list(): Promise<ContentSummary[]> {
    return api.get<ContentSummary[]>('/recommendations');
  },
};
