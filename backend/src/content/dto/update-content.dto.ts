import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';

/** Todos os campos opcionais — PATCH /contents/:id. */
export class UpdateContentDto extends PartialType(CreateContentDto) {}
