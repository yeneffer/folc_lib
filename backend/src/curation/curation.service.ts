import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../common/dto/paginated-result';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ContentStatus, CurationDecision } from '../common/enums';
import {
  ContentSummary,
  toContentSummary,
} from '../content/entities/content.entity';
import { CurationRepository } from './curation.repository';
import { ReviewDto } from './dto/review.dto';
import { checkSensitiveContent } from './sensitive-content';

export interface ReviewResult {
  contentId: string;
  status: ContentStatus;
  decisaoRegistrada: CurationDecision;
  /** RF04 (fluxo alternativo) — publicacao bloqueada automaticamente. */
  bloqueadoPorSensibilidade: boolean;
  termosSensiveis: string[];
}

@Injectable()
export class CurationService {
  private readonly logger = new Logger(CurationService.name);

  constructor(private readonly repo: CurationRepository) {}

  /** RF04 — fila de avaliacao (somente avaliador). */
  async queue(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ContentSummary>> {
    const { rows, total } = await this.repo.listQueue(query);
    return PaginatedResult.of(
      rows.map(toContentSummary),
      total,
      query.page,
      query.limit,
    );
  }

  /** RF04 — registra a decisao e atualiza o status do conteudo. */
  async review(
    contentId: string,
    dto: ReviewDto,
    avaliadorId: string,
  ): Promise<ReviewResult> {
    const content = await this.repo.findById(contentId);
    if (!content) throw new NotFoundException('Conteudo nao encontrado');
    if (content.status !== ContentStatus.EmAvaliacao) {
      throw new ConflictException('Conteudo nao esta em avaliacao');
    }

    // registra a decisao do avaliador
    await this.repo.insertReview({
      contentId,
      avaliadorId,
      decisao: dto.decisao,
      comentario: dto.comentario,
    });

    let status: ContentStatus;
    let publishedAt: string | null = null;
    let bloqueado = false;
    let termos: string[] = [];

    if (dto.decisao === CurationDecision.Aprovado) {
      const sensitivity = checkSensitiveContent([
        content.titulo,
        content.descricao,
        content.origem_cultural,
        content.evento,
        content.comunidade,
        JSON.stringify(content.metadata ?? {}),
      ]);

      if (sensitivity.flagged) {
        // bloqueio automatico da publicacao
        status = ContentStatus.Rejeitado;
        bloqueado = true;
        termos = sensitivity.terms;
        await this.repo.insertReview({
          contentId,
          avaliadorId,
          decisao: CurationDecision.Rejeitado,
          comentario: `Bloqueio automatico (RF04): termos sensiveis detectados: ${termos.join(', ')}`,
        });
        this.logger.warn(
          `Conteudo ${contentId} bloqueado automaticamente: ${termos.join(', ')}`,
        );
      } else {
        status = ContentStatus.Aprovado;
        publishedAt = new Date().toISOString();
      }
    } else if (dto.decisao === CurationDecision.AjustesSolicitados) {
      status = ContentStatus.Rascunho;
    } else {
      status = ContentStatus.Rejeitado;
    }

    await this.repo.updateStatus(contentId, status, publishedAt);

    return {
      contentId,
      status,
      decisaoRegistrada: dto.decisao,
      bloqueadoPorSensibilidade: bloqueado,
      termosSensiveis: termos,
    };
  }
}
