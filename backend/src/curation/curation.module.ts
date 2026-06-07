import { Module } from '@nestjs/common';
import { CurationController } from './curation.controller';
import { CurationRepository } from './curation.repository';
import { CurationService } from './curation.service';

/**
 * Modulo de curadoria (RF04). SupabaseModule e AuthModule sao globais.
 */
@Module({
  controllers: [CurationController],
  providers: [CurationService, CurationRepository],
  exports: [CurationService],
})
export class CurationModule {}
