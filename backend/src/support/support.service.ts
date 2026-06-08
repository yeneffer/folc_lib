import { Injectable } from '@nestjs/common';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import {
  ErrorReport,
  FaqItem,
  toErrorReport,
  toFaqItem,
} from './entities/support.entity';
import { SupportRepository } from './support.repository';

@Injectable()
export class SupportService {
  constructor(private readonly repo: SupportRepository) {}

  /** NF02 — FAQ. */
  async faq(): Promise<FaqItem[]> {
    const rows = await this.repo.listFaq();
    return rows.map(toFaqItem);
  }

  /** NF04 — registra relato de erro (aceita visitante). */
  async reportError(
    dto: CreateErrorReportDto,
    userId: string | null,
  ): Promise<ErrorReport> {
    const row = await this.repo.insertErrorReport({
      userId,
      descricao: dto.descricao,
      url: dto.url,
    });
    return toErrorReport(row);
  }
}
