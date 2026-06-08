import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsRepository } from './recommendations.repository';
import { RecommendationsService } from './recommendations.service';

/** Modulo de recomendacoes (RF07). SupabaseModule e AuthModule sao globais. */
@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsRepository],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
