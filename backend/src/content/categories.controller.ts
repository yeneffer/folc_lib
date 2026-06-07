import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly content: ContentService) {}

  /** RF08 — categorias para montar os filtros do acervo. */
  @Get()
  list() {
    return this.content.listCategories();
  }
}
