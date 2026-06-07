// Enums compartilhados — espelham documentacao/CONTRATOS-API.md
// e os enums do backend (backend/src/common/enums).

export type UserRole = 'aluno' | 'professor' | 'avaliador' | 'colaborador';

export type ContentType =
  | 'video'
  | 'poema'
  | 'lenda'
  | 'texto'
  | 'imagem'
  | 'receita'
  | 'musica';

export type ContentStatus =
  | 'rascunho'
  | 'em_avaliacao'
  | 'aprovado'
  | 'rejeitado';

export type CurationDecision =
  | 'aprovado'
  | 'ajustes_solicitados'
  | 'rejeitado';

export type ContributionStatus =
  | 'recebida'
  | 'em_avaliacao'
  | 'aprovada'
  | 'rejeitada';

export type AssignmentStatus = 'pendente' | 'concluido' | 'atrasado';

export type ErrorReportStatus = 'aberto' | 'em_analise' | 'resolvido';
