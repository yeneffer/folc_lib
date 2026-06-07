import { ContentStatus, ContentType } from '../../common/enums';

export interface Category {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
}

export interface ContentSummary {
  id: string;
  titulo: string;
  tipo: ContentType;
  thumbUrl: string | null;
  origemCultural: string | null;
  estado: string | null;
  pedagogico: boolean;
}

export interface ContentDetail extends ContentSummary {
  descricao: string | null;
  mediaUrl: string | null;
  categorias: Category[];
  evento: string | null;
  comunidade: string | null;
  ano: number | null;
  autor: { id: string; nome: string } | null;
  metadata: Record<string, unknown>;
  status: ContentStatus;
  publishedAt: string | null;
}

/** Linha bruta de public.contents. */
export interface ContentRow {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: ContentType;
  status: ContentStatus;
  autor_id: string | null;
  origem_cultural: string | null;
  estado: string | null;
  evento: string | null;
  comunidade: string | null;
  ano: number | null;
  media_url: string | null;
  thumb_url: string | null;
  pedagogico: boolean;
  metadata: Record<string, unknown> | null;
  published_at: string | null;
}

export interface CategoryRow {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
}

export function toCategory(row: CategoryRow): Category {
  return { id: row.id, nome: row.nome, slug: row.slug, tipo: row.tipo };
}

export function toContentSummary(row: ContentRow): ContentSummary {
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: row.tipo,
    thumbUrl: row.thumb_url,
    origemCultural: row.origem_cultural,
    estado: row.estado,
    pedagogico: row.pedagogico,
  };
}

export function toContentDetail(
  row: ContentRow,
  categorias: Category[],
  autor: { id: string; nome: string } | null,
): ContentDetail {
  return {
    ...toContentSummary(row),
    descricao: row.descricao,
    mediaUrl: row.media_url,
    categorias,
    evento: row.evento,
    comunidade: row.comunidade,
    ano: row.ano,
    autor,
    metadata: row.metadata ?? {},
    status: row.status,
    publishedAt: row.published_at,
  };
}
