import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AuthenticatedUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** RF01 — cadastro de usuario. */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /** RF01 — login. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Renova a sessao. */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  /**
   * Encerra a sessao. Auth opcional: o logout deve funcionar mesmo com token
   * ausente ou expirado (revoga no servidor apenas se houver token valido).
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(OptionalAuthGuard)
  async logout(@Req() req: Request) {
    const token = this.auth.extractToken(req);
    if (token) await this.auth.logout(token);
  }

  /** B1.3 — solicita redefinicao de senha. */
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email);
  }

  /** B1.3 — redefine a senha via token de recuperacao. */
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.accessToken, dto.novaSenha);
  }

  /** Perfil do usuario autenticado. */
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
