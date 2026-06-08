import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '../common/enums';
import { ContributionsService } from './contributions.service';
import { ApproveContributionDto } from './dto/approve-contribution.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributions: ContributionsService) {}

  /** RF05 — envia contribuicao (auth opcional: aceita visitante). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalAuthGuard)
  create(
    @Body() dto: CreateContributionDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.contributions.create(dto, user?.id ?? null);
  }

  /** B4.3 — minhas contribuicoes. */
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.contributions.listMine(user.id, query);
  }

  /** Fila de contribuicoes (avaliador). */
  @Get('queue')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.Avaliador)
  queue(@Query() query: PaginationQueryDto) {
    return this.contributions.queue(query);
  }

  /** B4.2 — aprova a contribuicao e gera conteudo em avaliacao. */
  @Post(':id/approve')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.Avaliador)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveContributionDto,
  ) {
    return this.contributions.approve(id, dto);
  }

  /** Rejeita a contribuicao. */
  @Post(':id/reject')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.Avaliador)
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributions.reject(id);
  }
}
