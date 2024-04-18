import type { Resource } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReposItemEnum } from '../enum/app.enum';
import { PickType } from '@nestjs/mapped-types';

/**
 * User类型
 */
export type ResourceType = Resource;

export class ResourceDTO implements ResourceType {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  mime: string;

  @IsString()
  size: string;

  @IsString()
  src: string;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  repositoryItemId: number;

  @IsNumber()
  userId: number;
}

export class CreateResource extends PickType(ResourceDTO, [
  'name',
  'mime',
  'size',
  'src',
] as const) {}
