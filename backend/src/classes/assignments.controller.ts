import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ClassesService } from './classes.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('assignments')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly classes: ClassesService) {}

  /** B5.2 — aluno marca o proprio progresso. */
  @Patch(':id/progress')
  @Roles(UserRole.Aluno)
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.classes.updateProgress(id, user.id, dto);
  }
}
