import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { OfflineService } from './offline.service';

@Controller('me/offline')
@UseGuards(SupabaseAuthGuard)
export class OfflineController {
  constructor(private readonly offline: OfflineService) {}

  /** RF06 — lista conteudos marcados para offline. */
  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.offline.list(user.id);
  }

  /** RF06 — marca um conteudo para offline. */
  @Post(':contentId')
  mark(
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.offline.mark(user.id, contentId);
  }

  /** Remove a marcacao. */
  @Delete(':contentId')
  unmark(
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.offline.unmark(user.id, contentId);
  }
}
