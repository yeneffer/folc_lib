import { Injectable } from '@nestjs/common';
import { ContentStatus } from '../common/enums';
import { ContentRow } from '../content/entities/content.entity';
import { SupabaseService } from '../supabase/supabase.service';

const SUMMARY = 'id, titulo, tipo, thumb_url, origem_cultural, estado, pedagogico';

@Injectable()
export class OfflineRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  async add(userId: string, contentId: string): Promise<void> {
    const { error } = await this.db
      .from('favorites')
      .insert({ user_id: userId, content_id: contentId });
    if (error && error.code !== '23505') throw error; // ignora duplicado
  }

  async remove(userId: string, contentId: string): Promise<void> {
    const { error } = await this.db
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);
    if (error) throw error;
  }

  /** Conteudos marcados para offline (apenas aprovados). */
  async list(userId: string): Promise<ContentRow[]> {
    const { data } = await this.db
      .from('favorites')
      .select(`contents!inner(${SUMMARY}, status)`)
      .eq('user_id', userId)
      .eq('contents.status', ContentStatus.Aprovado);

    type Row = { contents: ContentRow | ContentRow[] | null };
    return ((data ?? []) as unknown as Row[]).flatMap((r) =>
      Array.isArray(r.contents) ? r.contents : r.contents ? [r.contents] : [],
    );
  }
}
