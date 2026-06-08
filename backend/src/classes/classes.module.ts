import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { ClassesController } from './classes.controller';
import { ClassesRepository } from './classes.repository';
import { ClassesService } from './classes.service';
import { MeController } from './me.controller';

/**
 * Modulo de turmas, prazos e progresso (DesignPdf professor; B5).
 * SupabaseModule e AuthModule sao globais.
 */
@Module({
  controllers: [ClassesController, AssignmentsController, MeController],
  providers: [ClassesService, ClassesRepository],
  exports: [ClassesService],
})
export class ClassesModule {}
