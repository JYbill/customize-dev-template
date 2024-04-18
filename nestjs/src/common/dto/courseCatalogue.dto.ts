import type { CourseCatalogue } from '@prisma/client';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

/**
 * User类型
 */
export type CourseCatalogueType = CourseCatalogue;

export class CourseCatalogueDTO implements CourseCatalogueType {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  userId: number;
}
