import { Injectable } from '@nestjs/common';
import { ContentStatus, ContentType } from '../common/enums';
import { ContentRow } from '../content/entities/content.entity';
import { SupabaseService } from '../supabase/supabase.service';

const SUMMARY = 'id, titulo, tipo, thumb_url, origem_cultural, estado, pedagogico';

@Injectable()
export class RecommendationsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** Tipos e ids ja acessados pelo usuario (RF07). */
  async accessedByUser(
    userId: string,
    limit = 50,
  ): Promise<{ tipos: ContentType[]; contentIds: string[] }> {
    const { data } = await this.db
      .from('content_access_history')
      .select('content_id, contents!inner(tipo)')
      .eq('user_id', userId)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    type Row = { content_id: string; contents: { tipo: ContentType } };
    const rows = (data ?? []) as unknown as Row[];
    const tipos = Array.from(new Set(rows.map((r) => r.contents.tipo)));
    const contentIds = Array.from(new Set(rows.map((r) => r.content_id)));
    return { tipos, contentIds };
  }

  /** Conteudos aprovados dos tipos informados, excluindo ids ja vistos. */
  async byTypes(
    tipos: ContentType[],
    excludeIds: string[],
    limit: number,
  ): Promise<ContentRow[]> {
    let q = this.db
      .from('contents')
      .select(SUMMARY)
      .eq('status', ContentStatus.Aprovado)
      .in('tipo', tipos)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (excludeIds.length) q = q.not('id', 'in', `(${excludeIds.join(',')})`);
    const { data } = await q;
    return (data ?? []) as unknown as ContentRow[];
  }

  /** Ids mais acessados (popularidade) a partir do historico recente. */
  async popularContentIds(limit: number): Promise<string[]> {
    const { data } = await this.db
      .from('content_access_history')
      .select('content_id')
      .order('accessed_at', { ascending: false })
      .limit(2000);
    const tally = new Map<string, number>();
    for (const r of (data ?? []) as { content_id: string }[]) {
      tally.set(r.content_id, (tally.get(r.content_id) ?? 0) + 1);
    }
    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  async byIds(ids: string[]): Promise<ContentRow[]> {
    if (ids.length === 0) return [];
    const { data } = await this.db
      .from('contents')
      .select(SUMMARY)
      .eq('status', ContentStatus.Aprovado)
      .in('id', ids);
    const rows = (data ?? []) as unknown as ContentRow[];
    // preserva a ordem de popularidade
    const order = new Map(ids.map((id, i) => [id, i]));
    return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  async recentApproved(limit: number, excludeIds: string[]): Promise<ContentRow[]> {
    let q = this.db
      .from('contents')
      .select(SUMMARY)
      .eq('status', ContentStatus.Aprovado)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (excludeIds.length) q = q.not('id', 'in', `(${excludeIds.join(',')})`);
    const { data } = await q;
    return (data ?? []) as unknown as ContentRow[];
  }
}
