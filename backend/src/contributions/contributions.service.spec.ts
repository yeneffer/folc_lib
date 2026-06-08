import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ContentStatus, ContentType, ContributionStatus } from '../common/enums';
import { ContentRepository } from '../content/content.repository';
import { ContributionsRepository } from './contributions.repository';
import { ContributionsService } from './contributions.service';
import { ContributionRow } from './entities/contribution.entity';
import { invalidFiles } from './file-rules';

function makeRow(overrides: Partial<ContributionRow> = {}): ContributionRow {
  return {
    id: 'ct-1',
    colaborador_id: 'col-1',
    titulo: 'Relato cultural',
    descricao: 'Descricao',
    arquivos: [{ nome: 'foto.png', url: 'https://x/foto.png' }],
    status: ContributionStatus.Recebida,
    nome_contato: null,
    email_contato: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('invalidFiles (B4.4)', () => {
  it('aceita formatos da allowlist', () => {
    expect(invalidFiles([{ nome: 'a.png' }, { nome: 'b.mp4' }, { nome: 'c.pdf' }])).toEqual([]);
  });
  it('rejeita formatos fora da allowlist', () => {
    expect(invalidFiles([{ nome: 'malware.exe' }, { nome: 'ok.jpg' }])).toEqual(['malware.exe']);
  });
});

describe('ContributionsService', () => {
  let repo: jest.Mocked<ContributionsRepository>;
  let contentRepo: jest.Mocked<ContentRepository>;
  let service: ContributionsService;

  beforeEach(() => {
    repo = {
      insert: jest.fn(),
      findById: jest.fn(),
      listByColaborador: jest.fn(),
      listQueue: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue(makeRow()),
    } as unknown as jest.Mocked<ContributionsRepository>;
    contentRepo = {
      insert: jest.fn().mockResolvedValue({ id: 'content-9' }),
      categoryIdsBySlug: jest.fn().mockResolvedValue([]),
      setCategories: jest.fn(),
    } as unknown as jest.Mocked<ContentRepository>;
    service = new ContributionsService(repo, contentRepo);
  });

  it('rejeita criacao com arquivo de formato invalido', async () => {
    await expect(
      service.create(
        { titulo: 't', descricao: 'd', arquivos: [{ nome: 'x.exe', url: 'https://x/x.exe' }], aceiteTermos: true },
        'col-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('aceita visitante (colaboradorId null)', async () => {
    repo.insert.mockResolvedValue(makeRow({ colaborador_id: null }));
    await service.create(
      { titulo: 't', descricao: 'd', arquivos: [{ nome: 'a.png', url: 'https://x/a.png' }], aceiteTermos: true },
      null,
    );
    expect(repo.insert).toHaveBeenCalledWith(expect.objectContaining({ colaboradorId: null }));
  });

  it('aprovacao gera conteudo em avaliacao e marca a contribuicao', async () => {
    repo.findById.mockResolvedValue(makeRow());
    const res = await service.approve('ct-1', { tipo: ContentType.Lenda });
    expect(contentRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: ContentStatus.EmAvaliacao, autor_id: 'col-1' }),
    );
    expect(repo.updateStatus).toHaveBeenCalledWith('ct-1', ContributionStatus.Aprovada);
    expect(res.contentId).toBe('content-9');
  });

  it('nao aprova contribuicao ja avaliada', async () => {
    repo.findById.mockResolvedValue(makeRow({ status: ContributionStatus.Aprovada }));
    await expect(
      service.approve('ct-1', { tipo: ContentType.Lenda }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('404 ao aprovar contribuicao inexistente', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.approve('x', { tipo: ContentType.Lenda }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
