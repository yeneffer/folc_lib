import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { ContributionsController } from './contributions.controller';
import { ContributionsRepository } from './contributions.repository';
import { ContributionsService } from './contributions.service';

/**
 * Modulo de contribuicoes (RF05). Importa ContentModule para gerar conteudo
 * no acervo ao aprovar (B4.2). SupabaseModule e AuthModule sao globais.
 */
@Module({
  imports: [ContentModule],
  controllers: [ContributionsController],
  providers: [ContributionsService, ContributionsRepository],
  exports: [ContributionsService],
})
export class ContributionsModule {}
