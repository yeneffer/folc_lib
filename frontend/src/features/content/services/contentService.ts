import { api } from '@/lib/apiClient';
import type { ContentDetail, ContentSummary } from '@/types';

export const contentService = {
  // envia o Bearer se houver (registra historico para usuarios logados)
  getById(id: string): Promise<ContentDetail> {
    return api.get<ContentDetail>(`/contents/${id}`);
  },
};

export const offlineService = {
  list(): Promise<ContentSummary[]> {
    return api.get<ContentSummary[]>('/me/offline');
  },
  mark(contentId: string): Promise<{ contentId: string; saved: boolean }> {
    return api.post(`/me/offline/${contentId}`);
  },
  unmark(contentId: string): Promise<{ contentId: string; saved: boolean }> {
    return api.delete(`/me/offline/${contentId}`);
  },
};
