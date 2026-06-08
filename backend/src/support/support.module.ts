import { Module } from '@nestjs/common';
import {
  ErrorReportsController,
  FaqController,
} from './support.controller';
import { SupportRepository } from './support.repository';
import { SupportService } from './support.service';

/** Modulo de suporte: FAQ (NF02) e relato de erros (NF04). */
@Module({
  controllers: [FaqController, ErrorReportsController],
  providers: [SupportService, SupportRepository],
  exports: [SupportService],
})
export class SupportModule {}
