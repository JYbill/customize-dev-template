import type { Repository } from '@prisma/client';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

/**
 * User类型
 */
export type RepositoryType = Repository;

export class RepositoryDTO implements RepositoryType {
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
