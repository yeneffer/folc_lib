import { ErrorReportStatus } from '../../common/enums';

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}

export interface FaqRow {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}

export function toFaqItem(row: FaqRow): FaqItem {
  return {
    id: row.id,
    pergunta: row.pergunta,
    resposta: row.resposta,
    ordem: row.ordem,
  };
}

export interface ErrorReport {
  id: string;
  descricao: string;
  url: string | null;
  status: ErrorReportStatus;
  createdAt: string;
}

export interface ErrorReportRow {
  id: string;
  descricao: string;
  url: string | null;
  status: ErrorReportStatus;
  created_at: string;
}

export function toErrorReport(row: ErrorReportRow): ErrorReport {
  return {
    id: row.id,
    descricao: row.descricao,
    url: row.url,
    status: row.status,
    createdAt: row.created_at,
  };
}
