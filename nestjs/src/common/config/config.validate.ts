/**
 * @Description: Config Module 校验配置变量
 * @Author: 小钦var
 * @Date: 2023/10/12 10:29
 */
import { Expose, plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';
import * as path from 'node:path';

class EnvConfig implements IEnv {
  @Expose()
  @IsString()
  DATABASE_URL: string;

  @Expose()
  @IsString()
  JWT_SECRET: string;

  @Expose()
  @IsString()
  REDIS_PWD: string;

  @Expose()
  @IsString()
  REDIS_URL: string;

  @Expose()
  @IsString()
  JWT_EXPIRE: string;

  @Expose()
  @IsNumber()
  MAIL_REGISTER_EXPIRE: number;

  @Expose()
  @IsString()
  MAIL_USER: string;

  @Expose()
  @IsString()
  ROOT_USER: string;

  @Expose()
  @IsString()
  ROOT_PWD: string;

  @Expose()
  @IsString()
  HOST: string;

  @Expose()
  @IsString()
  APP_ROOT: string;
}

export function validateConfig(config: Record<string, unknown>) {
  // 字面量对象 -> class，开启隐式转换
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
  // 跳过未定义的属性
  const errors = validateSync(validatedConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    console.log(errors);
    throw new Error(errors.toString());
  }

  validatedConfig.APP_ROOT = path.resolve(__dirname, '../../');
  console.log(validatedConfig.APP_ROOT);
  return validatedConfig;
}
