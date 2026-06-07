import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentStatus, ContentType, UserRole } from '../common/enums';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { ContentRow } from './entities/content.entity';

function makeRow(overrides: Partial<ContentRow> = {}): ContentRow {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    titulo: 'Titulo',
    descricao: null,
    tipo: ContentType.Lenda,
    status: ContentStatus.Aprovado,
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

describe('ContentService', () => {
  let repo: jest.Mocked<ContentRepository>;
  let service: ContentService;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      findApprovedById: jest.fn(),
      findById: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      setCategories: jest.fn(),
      categoriesOf: jest.fn().mockResolvedValue([]),
      listCategories: jest.fn(),
      categoryIdsBySlug: jest.fn().mockResolvedValue([]),
      authorOf: jest.fn().mockResolvedValue(null),
      recordAccess: jest.fn(),
    } as unknown as jest.Mocked<ContentRepository>;
    service = new ContentService(repo);
  });

  describe('getById', () => {
    it('lanca 404 quando o conteudo nao existe/nao esta aprovado', async () => {
      repo.findApprovedById.mockResolvedValue(null);
      await expect(service.getById('x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('registra acesso quando ha usuario logado', async () => {
      repo.findApprovedById.mockResolvedValue(makeRow());
      await service.getById('id-1', 'user-9');
      expect(repo.recordAccess).toHaveBeenCalledWith('user-9', 'id-1');
    });

    it('nao registra acesso para visitante', async () => {
      repo.findApprovedById.mockResolvedValue(makeRow());
      await service.getById('id-1');
      expect(repo.recordAccess).not.toHaveBeenCalled();
    });
  });

  describe('create (B2.5 receita)', () => {
    it('rejeita receita sem ingredientes/modoPreparo', async () => {
      await expect(
        service.create(
          { titulo: 'Bolo', tipo: ContentType.Receita } as never,
          'autor-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.insert).not.toHaveBeenCalled();
    });

    it('aceita receita com metadata valido', async () => {
      repo.insert.mockResolvedValue(makeRow({ tipo: ContentType.Receita }));
      await service.create(
        {
          titulo: 'Acaraje',
          tipo: ContentType.Receita,
          metadata: { ingredientes: ['feijao'], modoPreparo: 'fritar' },
        } as never,
        'autor-1',
      );
      expect(repo.insert).toHaveBeenCalled();
    });
  });

  describe('update (permissao)', () => {
    it('proibe quem nao e autor nem avaliador', async () => {
      repo.findById.mockResolvedValue(makeRow({ autor_id: 'outro' }));
      await expect(
        service.update('id-1', { titulo: 'novo' }, { id: 'eu', role: UserRole.Aluno }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite o avaliador editar conteudo de terceiros', async () => {
      repo.findById.mockResolvedValue(makeRow({ autor_id: 'outro' }));
      repo.update.mockResolvedValue(makeRow({ titulo: 'novo' }));
      await service.update('id-1', { titulo: 'novo' }, { id: 'eu', role: UserRole.Avaliador });
      expect(repo.update).toHaveBeenCalled();
    });
  });
});
