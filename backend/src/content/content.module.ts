import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ContentController } from './content.controller';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';

/**
 * Modulo do acervo (RF03, RF08). SupabaseModule e AuthModule sao globais.
 */
@Module({
  controllers: [ContentController, CategoriesController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
