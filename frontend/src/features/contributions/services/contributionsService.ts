import { api, type Page } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';
import type { Contribution, ContributionRequest } from '@/types';

const BUCKET = 'contributions';

export const contributionsService = {
  /** Sobe um arquivo ao Storage e devolve {nome, url} para o contrato. */
  async uploadFile(file: File): Promise<{ nome: string; url: string }> {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { nome: file.name, url: data.publicUrl };
  },

  create(payload: ContributionRequest): Promise<Contribution> {
    return api.post<Contribution>('/contributions', payload);
  },

  mine(): Promise<Page<Contribution>> {
    return api.getPage<Contribution>('/contributions/me');
  },
};
