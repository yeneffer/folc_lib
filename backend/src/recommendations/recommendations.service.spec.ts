import { ContentType } from '../common/enums';
import { ContentRow } from '../content/entities/content.entity';
import { RecommendationsRepository } from './recommendations.repository';
import { RecommendationsService } from './recommendations.service';

function row(id: string): ContentRow {
  return {
    id,
    titulo: id,
    descricao: null,
    tipo: ContentType.Lenda,
    status: 'aprovado' as never,
    autor_id: null,
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
  };
}

describe('RecommendationsService', () => {
  let repo: jest.Mocked<RecommendationsRepository>;
  let service: RecommendationsService;

  beforeEach(() => {
    repo = {
      accessedByUser: jest.fn(),
      byTypes: jest.fn(),
      popularContentIds: jest.fn(),
      byIds: jest.fn(),
      recentApproved: jest.fn(),
    } as unknown as jest.Mocked<RecommendationsRepository>;
    service = new RecommendationsService(repo);
  });

  it('recomenda por historico quando ha tipos acessados', async () => {
    repo.accessedByUser.mockResolvedValue({ tipos: [ContentType.Lenda], contentIds: ['x'] });
    repo.byTypes.mockResolvedValue([row('a'), row('b')]);
    const res = await service.recommend('user-1');
    expect(res.map((r) => r.id)).toEqual(['a', 'b']);
    expect(repo.popularContentIds).not.toHaveBeenCalled();
  });

  it('cai no fallback de popularidade sem login', async () => {
    repo.popularContentIds.mockResolvedValue(['p1']);
    repo.byIds.mockResolvedValue([row('p1')]);
    repo.recentApproved.mockResolvedValue([row('r1')]);
    const res = await service.recommend(undefined, 2);
    expect(res.map((r) => r.id)).toEqual(['p1', 'r1']);
  });

  it('usa fallback quando o historico nao gera recomendacoes', async () => {
    repo.accessedByUser.mockResolvedValue({ tipos: [ContentType.Lenda], contentIds: [] });
    repo.byTypes.mockResolvedValue([]);
    repo.popularContentIds.mockResolvedValue([]);
    repo.byIds.mockResolvedValue([]);
    repo.recentApproved.mockResolvedValue([row('r1')]);
    const res = await service.recommend('user-1', 5);
    expect(res.map((r) => r.id)).toEqual(['r1']);
  });
});
