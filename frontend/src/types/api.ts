// Envelope da API — espelha CONTRATOS-API.md#envelope

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL';

/** Query base de listagem (?page=&limit=&sort=&order=&q=). */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
}
