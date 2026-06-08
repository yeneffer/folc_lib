import { ContributionStatus } from '../../common/enums';

export interface ContributionFile {
  nome: string;
  url: string;
}

export interface Contribution {
  id: string;
  titulo: string;
  descricao: string;
  status: ContributionStatus;
  arquivos: ContributionFile[];
  createdAt: string;
}

export interface ContributionRow {
  id: string;
  colaborador_id: string | null;
  titulo: string;
  descricao: string;
  arquivos: ContributionFile[] | null;
  status: ContributionStatus;
  nome_contato: string | null;
  email_contato: string | null;
  created_at: string;
}

export function toContribution(row: ContributionRow): Contribution {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    status: row.status,
    arquivos: row.arquivos ?? [],
    createdAt: row.created_at,
  };
}
