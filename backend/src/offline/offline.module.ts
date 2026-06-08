import { Module } from '@nestjs/common';
import { OfflineController } from './offline.controller';
import { OfflineRepository } from './offline.repository';
import { OfflineService } from './offline.service';

/** Modulo offline/favoritos (RF06). SupabaseModule e AuthModule sao globais. */
@Module({
  controllers: [OfflineController],
  providers: [OfflineService, OfflineRepository],
  exports: [OfflineService],
})
export class OfflineModule {}
