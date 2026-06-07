import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiError,
  ApiErrorCode,
  ApiErrorDetail,
} from '../interfaces/api-response.interface';

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  [HttpStatus.BAD_REQUEST]: ApiErrorCode.Validation,
  [HttpStatus.UNAUTHORIZED]: ApiErrorCode.Unauthenticated,
  [HttpStatus.FORBIDDEN]: ApiErrorCode.Forbidden,
  [HttpStatus.NOT_FOUND]: ApiErrorCode.NotFound,
  [HttpStatus.CONFLICT]: ApiErrorCode.Conflict,
};

/**
 * Converte qualquer excecao no envelope de erro padrao da API
 * (ver CONTRATOS-API.md#envelope). Mensagens ficam em pt-BR para exibicao.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details: ApiErrorDetail[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as { message?: string | string[] };
        if (Array.isArray(body.message)) {
          // erros do ValidationPipe (class-validator)
          message = 'Dados invalidos';
          details = body.message.map((m) => ({ field: '', message: m }));
        } else if (typeof body.message === 'string') {
          message = body.message;
        }
      }
    } else {
      // erro inesperado: loga o stack mas nao vaza ao cliente (LGPD)
      this.logger.error(exception);
    }

    const code = STATUS_TO_CODE[status] ?? ApiErrorCode.Internal;
    const payload: ApiError = { error: { code, message, details } };
    response.status(status).json(payload);
  }
}
