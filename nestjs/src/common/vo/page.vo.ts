import { IsNumber, IsOptional } from 'class-validator';

export class PageCommonVo {
  @IsNumber()
  @IsOptional()
  skip: number = 0;

  @IsNumber()
  @IsOptional()
  take: number = 200;
}
