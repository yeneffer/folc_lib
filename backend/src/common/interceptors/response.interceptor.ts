import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../dto/paginated-result';
import { ApiSuccess } from '../interfaces/api-response.interface';

/**
 * Embrulha toda resposta no envelope `{ data, meta? }`.
 * - PaginatedResult -> `{ data: items, meta }`
 * - qualquer outro valor -> `{ data: valor }`
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccess<unknown>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccess<unknown>> {
    return next.handle().pipe(
      map((payload): ApiSuccess<unknown> => {
        if (payload instanceof PaginatedResult) {
          return { data: payload.items, meta: payload.meta };
        }
        return { data: payload };
      }),
    );
  }
}
