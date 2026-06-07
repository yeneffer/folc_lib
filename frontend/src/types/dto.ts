// Payloads de entrada (request) — espelham CONTRATOS-API.md. Apenas tipos.

import type { UserRole, CurationDecision } from './enums';
import type { UserProfile } from './entities';

// ----- auth (RF01) -----
export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  aceiteTermos: true;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ----- curation (RF04) -----
export interface ReviewRequest {
  decisao: CurationDecision;
  comentario?: string;
}

// ----- contributions (RF05) -----
export interface ContributionRequest {
  titulo: string;
  descricao: string;
  arquivos: { nome: string; url: string }[];
  nomeContato?: string;
  emailContato?: string;
  aceiteTermos: true;
}

// ----- support (NF04) -----
export interface ErrorReportRequest {
  descricao: string;
  url?: string;
}
