// Entidades de dominio (contrato de saida da API) — espelham
// documentacao/CONTRATOS-API.md. Apenas tipos, sem logica.

import type {
  AssignmentStatus,
  ContentType,
  ContributionStatus,
  CurationDecision,
  UserRole,
} from './enums';
import type { PaginationQuery } from './api';

// ----- users (RF02) -----
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

// ----- content / acervo (RF03, RF08) -----
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
  descricao: string;
  mediaUrl: string | null;
  categorias: Category[];
  evento: string | null;
  comunidade: string | null;
  ano: number | null;
  autor: Pick<UserProfile, 'id' | 'nome'> | null;
  metadata: Record<string, unknown>; // receita: { ingredientes[], modoPreparo }
  publishedAt: string | null;
}

/** Filtros do acervo (RF08) — query de GET /contents. */
export interface AcervoQuery extends PaginationQuery {
  tipo?: ContentType | ContentType[];
  categoria?: string | string[];
  estado?: string;
  evento?: string;
  comunidade?: string;
  ano?: number;
  pedagogico?: boolean;
}

// ----- curation (RF04) -----
export interface CurationReview {
  id: string;
  contentId: string;
  avaliadorId: string;
  decisao: CurationDecision;
  comentario: string | null;
  createdAt: string;
}

// ----- contributions (RF05) -----
export interface Contribution {
  id: string;
  titulo: string;
  descricao: string;
  status: ContributionStatus;
  createdAt: string;
}

// ----- classes / turmas -----
export interface ClassSummary {
  id: string;
  nome: string;
  codigo: string;
  totalAlunos: number;
}

export interface Assignment {
  id: string;
  titulo: string;
  descricao: string | null;
  contentId: string | null;
  dueDate: string;
  status?: AssignmentStatus;
}

// ----- support (NF02, NF04) -----
export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}
