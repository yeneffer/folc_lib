import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedUser } from '../auth/types';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ClassesService } from './classes.service';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('classes')
@UseGuards(SupabaseAuthGuard)
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  /** B5.1 — cria turma (professor). */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Professor)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateClassDto,
  ) {
    return this.classes.create(user.id, dto);
  }

  /** Turmas do professor. */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Professor)
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.classes.listMine(user.id);
  }

  /** Detalhe + alunos (professor dono ou aluno membro). */
  @Get(':id')
  getDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classes.getDetail(id, user);
  }

  /** B5.1 — adiciona aluno (professor). */
  @Post(':id/students')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Professor)
  addStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddStudentDto,
  ) {
    return this.classes.addStudent(id, user.id, dto);
  }

  /** B5.2 — prazos da turma (professor dono ou aluno membro). */
  @Get(':id/assignments')
  listAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classes.listAssignments(id, user);
  }

  /** B5.2 — cria prazo (professor). */
  @Post(':id/assignments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Professor)
  createAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.classes.createAssignment(id, user.id, dto);
  }

  /** B5.3 — progresso dos alunos (professor). */
  @Get(':id/progress')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Professor)
  progress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classes.classProgress(id, user.id);
  }
}
