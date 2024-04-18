import type { RepositoryItem } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ReposItemEnum } from '../enum/app.enum';
import { PickType } from '@nestjs/mapped-types';

/**
 * User类型
 */
export type RepositoryItemType = RepositoryItem;

export class RepositoryItemDTO implements RepositoryItemType {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsEnum([ReposItemEnum.MIX, ReposItemEnum.HREF])
  type: number;

  @IsString()
  cover: string;

  @IsString()
  intro: string;

  @IsNumber()
  isRecommend: boolean;

  @IsNumber()
  sequence: number;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  repositoryId: number;

  @IsNumber()
  updateUserId: number;

  @IsNumber()
  userId: number;

  @IsUrl()
  url: string;
}

export class CreateReposItem extends PickType(RepositoryItemDTO, [
  'name',
  'cover',
  'type',
  'intro',
  'repositoryId',
  'url',
] as const) {
  @IsOptional()
  @IsString()
  intro: string = '';

  @IsOptional()
  @IsUrl()
  url: string;
}
