import { Injectable } from '@nestjs/common';
import {
  ContentSummary,
  toContentSummary,
} from '../content/entities/content.entity';
import { RecommendationsRepository } from './recommendations.repository';

@Injectable()
export class RecommendationsService {
  constructor(private readonly repo: RecommendationsRepository) {}

  /**
   * RF07 — recomenda conteudos. Para usuarios com historico, sugere por tipo
   * ja acessado (excluindo o que ja viu). Sem login ou sem historico, cai no
   * fallback por popularidade, completando com os mais recentes.
   */
  async recommend(userId?: string, limit = 10): Promise<ContentSummary[]> {
    if (userId) {
      const { tipos, contentIds } = await this.repo.accessedByUser(userId);
      if (tipos.length > 0) {
        const rows = await this.repo.byTypes(tipos, contentIds, limit);
        if (rows.length > 0) return rows.map(toContentSummary);
      }
    }
    return this.popularFallback(limit);
  }

  /** Fallback por popularidade, completado com recentes. */
  private async popularFallback(limit: number): Promise<ContentSummary[]> {
    const popularIds = await this.repo.popularContentIds(limit);
    const popular = await this.repo.byIds(popularIds);

    if (popular.length >= limit) {
      return popular.slice(0, limit).map(toContentSummary);
    }

    const faltam = limit - popular.length;
    const recentes = await this.repo.recentApproved(
      faltam,
      popular.map((r) => r.id),
    );
    return [...popular, ...recentes].slice(0, limit).map(toContentSummary);
  }
}
