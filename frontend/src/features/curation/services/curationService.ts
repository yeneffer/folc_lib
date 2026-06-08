import { api, type Page } from '@/lib/apiClient';
import type { ContentSummary, CurationDecision } from '@/types';

export interface ReviewResult {
  contentId: string;
  status: string;
  bloqueadoPorSensibilidade: boolean;
  termosSensiveis: string[];
}

export const curationService = {
  queue(page = 1): Promise<Page<ContentSummary>> {
    return api.getPage<ContentSummary>('/curation/queue', {
      query: { page, limit: 20 },
    });
  },

  review(
    contentId: string,
    decisao: CurationDecision,
    comentario?: string,
  ): Promise<ReviewResult> {
    return api.post<ReviewResult>(`/curation/${contentId}/review`, {
      decisao,
      comentario,
    });
  },
};
