import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSecurityDto } from './dto/update-security.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** RF02 — dados do proprio perfil. */
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findById(user.id);
  }

  /** Atualiza nome/avatar. */
  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(user.id, dto);
  }

  /** B1.5 — altera e-mail/senha. */
  @Patch('me/security')
  updateSecurity(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSecurityDto,
  ) {
    return this.users.updateSecurity(user.id, dto);
  }
}
