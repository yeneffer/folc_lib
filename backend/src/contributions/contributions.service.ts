import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../common/dto/paginated-result';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ContentStatus, ContributionStatus } from '../common/enums';
import { ContentRepository } from '../content/content.repository';
import { ContributionsRepository } from './contributions.repository';
import { ApproveContributionDto } from './dto/approve-contribution.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import {
  Contribution,
  toContribution,
} from './entities/contribution.entity';
import { invalidFiles } from './file-rules';

export interface ApproveResult {
  contributionId: string;
  contentId: string;
  status: ContributionStatus;
}

@Injectable()
export class ContributionsService {
  constructor(
    private readonly repo: ContributionsRepository,
    private readonly contentRepo: ContentRepository,
  ) {}

  /** RF05 — recebe uma contribuicao (aceita visitante). */
  async create(
    dto: CreateContributionDto,
    colaboradorId: string | null,
  ): Promise<Contribution> {
    // B4.4 — valida o formato dos arquivos
    const invalidos = invalidFiles(dto.arquivos);
    if (invalidos.length > 0) {
      throw new BadRequestException(
        `Formato nao aceito para: ${invalidos.join(', ')}. Ajuste os arquivos e tente novamente.`,
      );
    }

    const row = await this.repo.insert({
      colaboradorId,
      titulo: dto.titulo,
      descricao: dto.descricao,
      arquivos: dto.arquivos,
      nomeContato: dto.nomeContato,
      emailContato: dto.emailContato,
    });
    return toContribution(row);
  }

  /** B4.3 — minhas contribuicoes. */
  async listMine(
    colaboradorId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Contribution>> {
    const { rows, total } = await this.repo.listByColaborador(colaboradorId, query);
    return PaginatedResult.of(rows.map(toContribution), total, query.page, query.limit);
  }

  /** Fila de contribuicoes para a curadoria (avaliador). */
  async queue(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Contribution>> {
    const { rows, total } = await this.repo.listQueue(query);
    return PaginatedResult.of(rows.map(toContribution), total, query.page, query.limit);
  }

  /**
   * B4.2 — aprova a contribuicao: cria um conteudo em `em_avaliacao` no acervo
   * (que segue para a curadoria de conteudo, B3) e marca a contribuicao.
   */
  async approve(
    id: string,
    dto: ApproveContributionDto,
  ): Promise<ApproveResult> {
    const contribution = await this.repo.findById(id);
    if (!contribution) throw new NotFoundException('Contribuicao nao encontrada');
    if (
      contribution.status !== ContributionStatus.Recebida &&
      contribution.status !== ContributionStatus.EmAvaliacao
    ) {
      throw new ConflictException('Contribuicao ja avaliada');
    }

    const primeiroArquivo = contribution.arquivos?.[0]?.url ?? null;
    const content = await this.contentRepo.insert({
      titulo: contribution.titulo,
      descricao: contribution.descricao,
      tipo: dto.tipo,
      status: ContentStatus.EmAvaliacao,
      autor_id: contribution.colaborador_id,
      media_url: primeiroArquivo,
      metadata: {},
    });

    if (dto.categorias?.length) {
      const ids = await this.contentRepo.categoryIdsBySlug(dto.categorias);
      await this.contentRepo.setCategories(content.id, ids);
    }

    await this.repo.updateStatus(id, ContributionStatus.Aprovada);

    return {
      contributionId: id,
      contentId: content.id,
      status: ContributionStatus.Aprovada,
    };
  }

  /** Rejeita a contribuicao. */
  async reject(id: string): Promise<{ id: string; status: ContributionStatus }> {
    const contribution = await this.repo.findById(id);
    if (!contribution) throw new NotFoundException('Contribuicao nao encontrada');
    await this.repo.updateStatus(id, ContributionStatus.Rejeitada);
    return { id, status: ContributionStatus.Rejeitada };
  }
}
