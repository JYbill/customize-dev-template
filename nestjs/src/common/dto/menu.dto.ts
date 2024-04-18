import type { Menu } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { MenuTypeEnum } from 'src/common/enum/app.enum';
import { PickType } from '@nestjs/mapped-types';

/**
 * Menu类型
 */
export type MenuType = Menu;

export class MenuDTO implements MenuType {
  @IsNumber()
  id: number;

  @IsEnum([MenuTypeEnum.FOLDER, MenuTypeEnum.HREF])
  type: number;

  @IsString()
  title: string;

  @IsUrl()
  url: string;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsNumber()
  isDelete: boolean;

  @IsNumber()
  userId: number;

  @IsNumber()
  menuId: number;
}

export class CreateMenu extends PickType(MenuDTO, [
  'title',
  'type',
  'url',
  'menuId',
] as const) {
  @IsString()
  url: string = '';

  @IsNumber()
  @IsOptional()
  menuId: number;
}
