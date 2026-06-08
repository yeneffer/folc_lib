import { api } from '@/lib/apiClient';
import type { FaqItem } from '@/types';

export const supportService = {
  faq(): Promise<FaqItem[]> {
    return api.get<FaqItem[]>('/faq', { auth: false });
  },
  // auth opcional: envia o Bearer se houver
  reportError(payload: { descricao: string; url?: string }): Promise<{ id: string }> {
    return api.post<{ id: string }>('/error-reports', payload);
  },
};
