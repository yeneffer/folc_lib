// Enums compartilhados — espelham documentacao/CONTRATOS-API.md e os enums
// do Postgres (migration 0002_schema.sql).

export enum UserRole {
  Aluno = 'aluno',
  Professor = 'professor',
  Avaliador = 'avaliador',
  Colaborador = 'colaborador',
}

export enum ContentType {
  Video = 'video',
  Poema = 'poema',
  Lenda = 'lenda',
  Texto = 'texto',
  Imagem = 'imagem',
  Receita = 'receita',
  Musica = 'musica',
}

export enum ContentStatus {
  Rascunho = 'rascunho',
  EmAvaliacao = 'em_avaliacao',
  Aprovado = 'aprovado',
  Rejeitado = 'rejeitado',
}

export enum CurationDecision {
  Aprovado = 'aprovado',
  AjustesSolicitados = 'ajustes_solicitados',
  Rejeitado = 'rejeitado',
}

export enum ContributionStatus {
  Recebida = 'recebida',
  EmAvaliacao = 'em_avaliacao',
  Aprovada = 'aprovada',
  Rejeitada = 'rejeitada',
}

export enum AssignmentStatus {
  Pendente = 'pendente',
  Concluido = 'concluido',
  Atrasado = 'atrasado',
}

export enum ErrorReportStatus {
  Aberto = 'aberto',
  EmAnalise = 'em_analise',
  Resolvido = 'resolvido',
}
