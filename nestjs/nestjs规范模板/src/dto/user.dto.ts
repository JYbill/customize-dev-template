import { OmitType, PickType } from '@nestjs/mapped-types';
import type { User } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Role } from '../enum/app.enum';

/**
 * User类型
 */
export type UserType = User;

/**
 * 校验类：User完整的校验类
 */
export class UserDTO implements UserType {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  avatar: string;

  @IsString()
  name: string;

  @IsBoolean()
  banned: boolean;

  @IsString()
  password: string;

  @IsDate()
  createTime: Date;

  @IsDate()
  updateTime: Date;

  @IsBoolean()
  isDelete: boolean;

  @IsNumber()
  roleId: number;
}

export class Register extends PickType(UserDTO, [
  'email',
  'name',
  'password',
] as const) {}

/**
 * 管理员创建账号
 */
export class Account extends PickType(UserDTO, [
  'email',
  'name',
  'password',
] as const) {
  @IsEnum([Role.USER, Role.ADMIN])
  role: Role;
}
