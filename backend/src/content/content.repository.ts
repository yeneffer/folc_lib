import { Injectable } from '@nestjs/common';
import { ContentStatus } from '../common/enums';
import { SupabaseService } from '../supabase/supabase.service';
import { AcervoQueryDto } from './dto/acervo-query.dto';
import {
  CategoryRow,
  ContentRow,
} from './entities/content.entity';

const SUMMARY_COLUMNS =
  'id, titulo, tipo, thumb_url, origem_cultural, estado, pedagogico';
const FULL_COLUMNS = '*';

/**
 * Acesso a dados do acervo. O backend usa a service role (ignora RLS), por
 * isso as restricoes de visibilidade (ex.: somente aprovados) sao aplicadas
 * explicitamente aqui.
 */
@Injectable()
export class ContentRepository {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.getClient();
  }

  /** Resolve slugs de categoria para ids. */
  async categoryIdsBySlug(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const { data } = await this.db
      .from('categories')
      .select('id')
      .in('slug', slugs);
    return (data ?? []).map((r) => (r as { id: string }).id);
  }

  /** Ids de conteudo que pertencem a alguma das categorias. */
  private async contentIdsByCategoryIds(
    categoryIds: string[],
  ): Promise<string[]> {
    const { data } = await this.db
      .from('content_categories')
      .select('content_id')
      .in('category_id', categoryIds);
    return (data ?? []).map((r) => (r as { content_id: string }).content_id);
  }

  /** RF03/RF08 — lista paginada do acervo aprovado, com filtros. */
  async list(
    query: AcervoQueryDto,
  ): Promise<{ rows: ContentRow[]; total: number }> {
    let q = this.db
      .from('contents')
      .select(SUMMARY_COLUMNS, { count: 'exact' })
      .eq('status', ContentStatus.Aprovado);

    if (query.tipo?.length) q = q.in('tipo', query.tipo);
    if (query.estado) q = q.eq('estado', query.estado);
    if (query.evento) q = q.eq('evento', query.evento);
    if (query.comunidade) q = q.eq('comunidade', query.comunidade);
    if (query.ano !== undefined) q = q.eq('ano', query.ano);
    if (query.pedagogico !== undefined) q = q.eq('pedagogico', query.pedagogico);
    if (query.q) q = q.ilike('titulo', `%${query.q}%`);

    if (query.categoria?.length) {
      const catIds = await this.categoryIdsBySlug(query.categoria);
      const contentIds = await this.contentIdsByCategoryIds(catIds);
      // sem correspondencia -> resultado vazio
      q = q.in('id', contentIds.length ? contentIds : ['00000000-0000-0000-0000-000000000000']);
    }

    const sortCol = query.sort ?? 'published_at';
    q = q.order(sortCol, { ascending: query.order === 'asc', nullsFirst: false });
    q = q.range(query.offset, query.offset + query.limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;
    return { rows: (data ?? []) as unknown as ContentRow[], total: count ?? 0 };
  }

  /** Busca um conteudo aprovado por id. */
  async findApprovedById(id: string): Promise<ContentRow | null> {
    const { data } = await this.db
      .from('contents')
      .select(FULL_COLUMNS)
      .eq('id', id)
      .eq('status', ContentStatus.Aprovado)
      .maybeSingle();
    return (data as ContentRow) ?? null;
  }

  /** Busca por id sem filtrar status (para checagem de dono na edicao). */
  async findById(id: string): Promise<ContentRow | null> {
    const { data } = await this.db
      .from('contents')
      .select(FULL_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    return (data as ContentRow) ?? null;
  }

  async insert(values: Partial<ContentRow>): Promise<ContentRow> {
    const { data, error } = await this.db
      .from('contents')
      .insert(values)
      .select(FULL_COLUMNS)
      .single();
    if (error) throw error;
    return data as ContentRow;
  }

  async update(id: string, patch: Partial<ContentRow>): Promise<ContentRow> {
    const { data, error } = await this.db
      .from('contents')
      .update(patch)
      .eq('id', id)
      .select(FULL_COLUMNS)
      .single();
    if (error) throw error;
    return data as ContentRow;
  }

  async setCategories(contentId: string, categoryIds: string[]): Promise<void> {
    await this.db.from('content_categories').delete().eq('content_id', contentId);
    if (categoryIds.length === 0) return;
    await this.db
      .from('content_categories')
      .insert(categoryIds.map((category_id) => ({ content_id: contentId, category_id })));
  }

  async categoriesOf(contentId: string): Promise<CategoryRow[]> {
    const { data } = await this.db
      .from('content_categories')
      .select('categories(*)')
      .eq('content_id', contentId);
    const rows = (data ?? []) as unknown as Array<{
      categories: CategoryRow | CategoryRow[] | null;
    }>;
    return rows.flatMap((r) =>
      Array.isArray(r.categories) ? r.categories : r.categories ? [r.categories] : [],
    );
  }

  async listCategories(): Promise<CategoryRow[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .order('nome', { ascending: true });
    return (data ?? []) as CategoryRow[];
  }

  async authorOf(autorId: string): Promise<{ id: string; nome: string } | null> {
    const { data } = await this.db
      .from('profiles')
      .select('id, nome')
      .eq('id', autorId)
      .maybeSingle();
    return (data as { id: string; nome: string }) ?? null;
  }

  /** RF07 base — registra acesso (best-effort). */
  async recordAccess(userId: string, contentId: string): Promise<void> {
    await this.db
      .from('content_access_history')
      .insert({ user_id: userId, content_id: contentId })
      .then(undefined, () => undefined);
  }
}
