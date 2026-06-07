// Envelope padrao de resposta da API — ver CONTRATOS-API.md#envelope

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
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

/** Codigos de erro estaveis consumidos pelo frontend. */
export enum ApiErrorCode {
  Validation = 'VALIDATION_ERROR',
  Unauthenticated = 'UNAUTHENTICATED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Conflict = 'CONFLICT',
  Internal = 'INTERNAL',
}
