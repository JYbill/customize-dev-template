import type { Course } from '@prisma/client';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

/**
 * User类型
 */
export type CourseType = Course;

/**
 * Prisma Select 所需要的字段
 */
export type CourseKeyType = {
  [Key in keyof CourseType]: true;
};
export class CourseDTO implements CourseType {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  cover: string;

  @IsString()
  organization: string;

  @IsString()
  speaker: string;

  @IsString()
  src: string;

  @IsNumber()
  type: number;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  userId: number;

  @IsNumber()
  courseCatalogueId: number;
}

export class CreateCourse extends PickType(CourseDTO, [
  'name',
  'cover',
  'organization',
  'speaker',
  'src',
  'type',
  'courseCatalogueId',
] as const) {}
