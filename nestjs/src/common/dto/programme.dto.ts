import type { Programme } from '@prisma/client';
import { IsBoolean, IsDate, IsEnum, IsNumber } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { ProgrammeEnum } from '../enum/app.enum';

/**
 * Programme类型
 */
export type ProgrammeType = Programme;

export class ProgrammeDTO implements ProgrammeType {
  @IsNumber()
  id: number;

  @IsEnum([ProgrammeEnum.REPOS, ProgrammeEnum.COURSE])
  type: number;

  @IsNumber()
  sequence: number;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  dataId: number;

  @IsNumber()
  userId: number;
}
export class CreateProgramme extends PickType(ProgrammeDTO, [
  'type',
  'dataId',
] as const) {}
