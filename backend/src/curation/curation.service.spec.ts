import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContentStatus, ContentType, CurationDecision } from '../common/enums';
import { ContentRow } from '../content/entities/content.entity';
import { CurationRepository } from './curation.repository';
import { CurationService } from './curation.service';
import { checkSensitiveContent } from './sensitive-content';

function makeRow(overrides: Partial<ContentRow> = {}): ContentRow {
  return {
    id: 'c-1',
    titulo: 'Lenda do Saci',
    descricao: 'Conteudo cultural',
    tipo: ContentType.Lenda,
    status: ContentStatus.EmAvaliacao,
    autor_id: 'autor-1',
    origem_cultural: null,
    estado: null,
    evento: null,
    comunidade: null,
    ano: null,
    media_url: null,
    thumb_url: null,
    pedagogico: false,
    metadata: {},
    published_at: null,
    ...overrides,
  };
}

describe('checkSensitiveContent', () => {
  it('sinaliza termos sensiveis', () => {
    const r = checkSensitiveContent(['texto com estereotipo presente']);
    expect(r.flagged).toBe(true);
    expect(r.terms).toContain('estereotipo');
  });
  it('nao sinaliza conteudo neutro', () => {
    expect(checkSensitiveContent(['receita de bolo de fuba']).flagged).toBe(false);
  });
});

describe('CurationService.review', () => {
  let repo: jest.Mocked<CurationRepository>;
  let service: CurationService;

  beforeEach(() => {
    repo = {
      listQueue: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue(makeRow()),
      insertReview: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CurationRepository>;
    service = new CurationService(repo);
  });

  it('aprova e publica conteudo neutro', async () => {
    repo.findById.mockResolvedValue(makeRow());
    const res = await service.review('c-1', { decisao: CurationDecision.Aprovado }, 'av-1');
    expect(res.status).toBe(ContentStatus.Aprovado);
    expect(res.bloqueadoPorSensibilidade).toBe(false);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      'c-1',
      ContentStatus.Aprovado,
      expect.any(String),
    );
  });

  it('bloqueia automaticamente a publicacao de conteudo sensivel (RF04)', async () => {
    repo.findById.mockResolvedValue(
      makeRow({ descricao: 'contem estereotipo ofensivo' }),
    );
    const res = await service.review('c-1', { decisao: CurationDecision.Aprovado }, 'av-1');
    expect(res.bloqueadoPorSensibilidade).toBe(true);
    expect(res.status).toBe(ContentStatus.Rejeitado);
    // registra a decisao do avaliador + a revisao automatica de bloqueio
    expect(repo.insertReview).toHaveBeenCalledTimes(2);
    expect(repo.updateStatus).toHaveBeenCalledWith('c-1', ContentStatus.Rejeitado, null);
  });

  it('ajustes solicitados -> rascunho', async () => {
    repo.findById.mockResolvedValue(makeRow());
    const res = await service.review(
      'c-1',
      { decisao: CurationDecision.AjustesSolicitados },
      'av-1',
    );
    expect(res.status).toBe(ContentStatus.Rascunho);
  });

  it('rejeita conteudo', async () => {
    repo.findById.mockResolvedValue(makeRow());
    const res = await service.review('c-1', { decisao: CurationDecision.Rejeitado }, 'av-1');
    expect(res.status).toBe(ContentStatus.Rejeitado);
  });

  it('404 quando o conteudo nao existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.review('x', { decisao: CurationDecision.Aprovado }, 'av-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('409 quando o conteudo nao esta em avaliacao', async () => {
    repo.findById.mockResolvedValue(makeRow({ status: ContentStatus.Aprovado }));
    await expect(
      service.review('c-1', { decisao: CurationDecision.Aprovado }, 'av-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
