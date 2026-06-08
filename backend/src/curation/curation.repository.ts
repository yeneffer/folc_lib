import { Injectable } from '@nestjs/common';
import { ContentStatus, CurationDecision } from '../common/enums';
import { ContentRow } from '../content/entities/content.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CurationRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** RF04 — fila de conteudos aguardando avaliacao. */
  async listQueue(
    query: PaginationQueryDto,
  ): Promise<{ rows: ContentRow[]; total: number }> {
    const { data, count, error } = await this.db
      .from('contents')
      .select('*', { count: 'exact' })
      .eq('status', ContentStatus.EmAvaliacao)
      .order('created_at', { ascending: true })
      .range(query.offset, query.offset + query.limit - 1);
    if (error) throw error;
    return { rows: (data ?? []) as ContentRow[], total: count ?? 0 };
  }

  async findById(id: string): Promise<ContentRow | null> {
    const { data } = await this.db
      .from('contents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return (data as ContentRow) ?? null;
  }

  async updateStatus(
    id: string,
    status: ContentStatus,
    publishedAt: string | null,
  ): Promise<ContentRow> {
    const patch: Record<string, unknown> = { status };
    if (publishedAt !== undefined) patch.published_at = publishedAt;
    const { data, error } = await this.db
      .from('contents')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as ContentRow;
  }

  async insertReview(review: {
    contentId: string;
    avaliadorId: string;
    decisao: CurationDecision;
    comentario?: string | null;
  }): Promise<void> {
    const { error } = await this.db.from('curation_reviews').insert({
      content_id: review.contentId,
      avaliador_id: review.avaliadorId,
      decisao: review.decisao,
      comentario: review.comentario ?? null,
    });
    if (error) throw error;
  }
}
