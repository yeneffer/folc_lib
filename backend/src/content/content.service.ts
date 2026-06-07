import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResult } from '../common/dto/paginated-result';
import { ContentStatus, ContentType, UserRole } from '../common/enums';
import { ContentRepository } from './content.repository';
import { AcervoQueryDto } from './dto/acervo-query.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  Category,
  ContentDetail,
  ContentRow,
  ContentSummary,
  toCategory,
  toContentDetail,
  toContentSummary,
} from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(private readonly repo: ContentRepository) {}

  /** RF03/RF08 — lista o acervo aprovado com filtros e paginacao. */
  async list(query: AcervoQueryDto): Promise<PaginatedResult<ContentSummary>> {
    const { rows, total } = await this.repo.list(query);
    return PaginatedResult.of(
      rows.map(toContentSummary),
      total,
      query.page,
      query.limit,
    );
  }

  async listCategories(): Promise<Category[]> {
    const rows = await this.repo.listCategories();
    return rows.map(toCategory);
  }

  /** RF03 — detalhe de um conteudo aprovado; registra acesso se logado. */
  async getById(id: string, userId?: string): Promise<ContentDetail> {
    const row = await this.repo.findApprovedById(id);
    if (!row) throw new NotFoundException('Conteudo nao encontrado');

    if (userId) {
      await this.repo.recordAccess(userId, id);
    }
    return this.buildDetail(row);
  }

  /** RF03 — cria conteudo; entra como `em_avaliacao` (RF04). */
  async create(dto: CreateContentDto, autorId: string): Promise<ContentDetail> {
    this.assertReceitaMetadata(dto.tipo, dto.metadata);

    const row = await this.repo.insert({
      titulo: dto.titulo,
      descricao: dto.descricao ?? null,
      tipo: dto.tipo,
      status: ContentStatus.EmAvaliacao,
      autor_id: autorId,
      origem_cultural: dto.origemCultural ?? null,
      estado: dto.estado ?? null,
      evento: dto.evento ?? null,
      comunidade: dto.comunidade ?? null,
      ano: dto.ano ?? null,
      media_url: dto.mediaUrl ?? null,
      thumb_url: dto.thumbUrl ?? null,
      pedagogico: dto.pedagogico ?? false,
      metadata: dto.metadata ?? {},
    });

    if (dto.categorias?.length) {
      const ids = await this.repo.categoryIdsBySlug(dto.categorias);
      await this.repo.setCategories(row.id, ids);
    }
    return this.buildDetail(row);
  }

  /** Edita um conteudo (somente autor ou avaliador). */
  async update(
    id: string,
    dto: UpdateContentDto,
    user: { id: string; role: UserRole },
  ): Promise<ContentDetail> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Conteudo nao encontrado');

    const isOwner = existing.autor_id === user.id;
    const isAvaliador = user.role === UserRole.Avaliador;
    if (!isOwner && !isAvaliador) {
      throw new ForbiddenException('Sem permissao para editar este conteudo');
    }

    const tipo = dto.tipo ?? existing.tipo;
    if (dto.metadata !== undefined) this.assertReceitaMetadata(tipo, dto.metadata);

    const patch: Partial<ContentRow> = {};
    if (dto.titulo !== undefined) patch.titulo = dto.titulo;
    if (dto.descricao !== undefined) patch.descricao = dto.descricao;
    if (dto.tipo !== undefined) patch.tipo = dto.tipo;
    if (dto.origemCultural !== undefined) patch.origem_cultural = dto.origemCultural;
    if (dto.estado !== undefined) patch.estado = dto.estado;
    if (dto.evento !== undefined) patch.evento = dto.evento;
    if (dto.comunidade !== undefined) patch.comunidade = dto.comunidade;
    if (dto.ano !== undefined) patch.ano = dto.ano;
    if (dto.mediaUrl !== undefined) patch.media_url = dto.mediaUrl;
    if (dto.thumbUrl !== undefined) patch.thumb_url = dto.thumbUrl;
    if (dto.pedagogico !== undefined) patch.pedagogico = dto.pedagogico;
    if (dto.metadata !== undefined) patch.metadata = dto.metadata;

    const row = await this.repo.update(id, patch);

    if (dto.categorias !== undefined) {
      const ids = await this.repo.categoryIdsBySlug(dto.categorias);
      await this.repo.setCategories(id, ids);
    }
    return this.buildDetail(row);
  }

  // --- helpers ---

  private async buildDetail(row: ContentRow): Promise<ContentDetail> {
    const categorias = (await this.repo.categoriesOf(row.id)).map(toCategory);
    const autor = row.autor_id ? await this.repo.authorOf(row.autor_id) : null;
    return toContentDetail(row, categorias, autor);
  }

  /** B2.5 — receita exige ingredientes e modo de preparo no metadata. */
  private assertReceitaMetadata(
    tipo: ContentType,
    metadata?: Record<string, unknown>,
  ): void {
    if (tipo !== ContentType.Receita) return;
    const ingredientes = metadata?.ingredientes;
    const modoPreparo = metadata?.modoPreparo;
    if (!Array.isArray(ingredientes) || ingredientes.length === 0 || !modoPreparo) {
      throw new BadRequestException(
        'Receita requer metadata.ingredientes (lista) e metadata.modoPreparo',
      );
    }
  }
}
