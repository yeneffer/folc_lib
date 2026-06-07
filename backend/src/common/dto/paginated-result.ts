import { PaginationMeta } from '../interfaces/api-response.interface';

/**
 * Retorno padrao de endpoints paginados. O ResponseInterceptor o converte
 * em `{ data: items, meta }` no envelope da API.
 */
export class PaginatedResult<T> {
  constructor(
    public readonly items: T[],
    public readonly meta: PaginationMeta,
  ) {}

  static of<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return new PaginatedResult<T>(items, { page, limit, total });
  }
}
