import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import { SupportService } from './support.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly support: SupportService) {}

  /** NF02 — lista publica de FAQ. */
  @Get()
  list() {
    return this.support.faq();
  }
}

@Controller('error-reports')
export class ErrorReportsController {
  constructor(private readonly support: SupportService) {}

  /** NF04 — relata um erro (auth opcional: aceita visitante). */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalAuthGuard)
  create(
    @Body() dto: CreateErrorReportDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.support.reportError(dto, user?.id ?? null);
  }
}
