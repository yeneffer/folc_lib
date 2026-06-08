import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { CommonModule } from './common/common.module';
import { ContentModule } from './content/content.module';
import { ContributionsModule } from './contributions/contributions.module';
import { CurationModule } from './curation/curation.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SupportModule } from './support/support.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    ContentModule,
    CurationModule,
    ContributionsModule,
    ClassesModule,
    RecommendationsModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
