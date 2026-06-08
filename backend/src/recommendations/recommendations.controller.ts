import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  /** RF07 — recomendados (por historico ou populares). Auth opcional. */
  @Get()
  @UseGuards(OptionalAuthGuard)
  list(@CurrentUser() user?: AuthenticatedUser) {
    return this.recommendations.recommend(user?.id);
  }
}
