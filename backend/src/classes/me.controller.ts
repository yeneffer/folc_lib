import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { ClassesService } from './classes.service';

@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class MeController {
  constructor(private readonly classes: ClassesService) {}

  /** B5.4 — historico de conteudos acessados. */
  @Get('history')
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.classes.history(user.id);
  }
}
