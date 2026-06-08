import type { ApiError, ApiErrorCode, PaginationMeta } from '@/types';
import { env } from './env';
import { tokenStorage } from './token-storage';

/** Erro normalizado a partir do envelope de erro da API. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface Page<T> {
  items: T[];
  meta?: PaginationMeta;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Anexa o Bearer token (default: true). */
  auth?: boolean;
  query?: Record<string, unknown>;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const url = new URL(`${env.apiUrl}/api${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function call<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: PaginationMeta }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth !== false) {
    const token = tokenStorage.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (json as ApiError | null)?.error;
    throw new ApiClientError(
      err?.code ?? 'INTERNAL',
      err?.message ?? 'Erro inesperado',
      res.status,
      err?.details,
    );
  }
  return { data: json?.data as T, meta: json?.meta };
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    call<T>(path, { ...opts, method: 'GET' }).then((r) => r.data),

  /** Lista paginada: retorna itens + meta. */
  getPage: <T>(path: string, opts?: RequestOptions) =>
    call<T[]>(path, { ...opts, method: 'GET' }).then(
      (r): Page<T> => ({ items: r.data ?? [], meta: r.meta }),
    ),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    call<T>(path, { ...opts, method: 'POST', body }).then((r) => r.data),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    call<T>(path, { ...opts, method: 'PATCH', body }).then((r) => r.data),

  delete: <T>(path: string, opts?: RequestOptions) =>
    call<T>(path, { ...opts, method: 'DELETE' }).then((r) => r.data),
};
