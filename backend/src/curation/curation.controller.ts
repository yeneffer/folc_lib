import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '../common/enums';
import { CurationService } from './curation.service';
import { ReviewDto } from './dto/review.dto';

@Controller('curation')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.Avaliador)
export class CurationController {
  constructor(private readonly curation: CurationService) {}

  /** RF04 — fila de conteudos em avaliacao. */
  @Get('queue')
  queue(@Query() query: PaginationQueryDto) {
    return this.curation.queue(query);
  }

  /** RF04 — registra a decisao de curadoria sobre um conteudo. */
  @Post(':contentId/review')
  review(
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Body() dto: ReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.curation.review(contentId, dto, user.id);
  }
}
