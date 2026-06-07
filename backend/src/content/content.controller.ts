import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UserRole } from '../common/enums';
import { ContentService } from './content.service';
import { AcervoQueryDto } from './dto/acervo-query.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('contents')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  /** RF03/RF08 — lista publica do acervo aprovado, com filtros. */
  @Get()
  list(@Query() query: AcervoQueryDto) {
    return this.content.list(query);
  }

  /** RF03 — detalhe; registra acesso se autenticado (auth opcional). */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.content.getById(id, user?.id);
  }

  /** RF03 — cria conteudo (entra em avaliacao). */
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.Colaborador, UserRole.Avaliador, UserRole.Professor)
  create(
    @Body() dto: CreateContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.content.create(dto, user.id);
  }

  /** Edita conteudo (autor ou avaliador — checado no service). */
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.content.update(id, dto, user);
  }
}
