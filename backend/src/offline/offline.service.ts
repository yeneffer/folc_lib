import { Injectable } from '@nestjs/common';
import {
  ContentSummary,
  toContentSummary,
} from '../content/entities/content.entity';
import { OfflineRepository } from './offline.repository';

@Injectable()
export class OfflineService {
  constructor(private readonly repo: OfflineRepository) {}

  /** RF06 — marca conteudo para acesso offline. */
  async mark(userId: string, contentId: string): Promise<{ contentId: string; saved: boolean }> {
    await this.repo.add(userId, contentId);
    return { contentId, saved: true };
  }

  /** Remove a marcacao offline. */
  async unmark(userId: string, contentId: string): Promise<{ contentId: string; saved: boolean }> {
    await this.repo.remove(userId, contentId);
    return { contentId, saved: false };
  }

  /** Lista os conteudos marcados para offline. */
  async list(userId: string): Promise<ContentSummary[]> {
    const rows = await this.repo.list(userId);
    return rows.map(toContentSummary);
  }
}
