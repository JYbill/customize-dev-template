import Redis from 'ioredis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PRISMA_MODULE_INJECT_ID } from '../prisma/prisma.builder';
import { Prisma } from '@prisma/client';
import { MODULE_OPTIONS_TOKEN } from './redis.builder';

@Injectable()
export class RedisService extends Redis {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    private readonly configService: ConfigService<IEnv>,
    @Inject(MODULE_OPTIONS_TOKEN) options: Record<string, any>,
  ) {
    super(configService.get('REDIS_URL'), {
      keyPrefix: configService.get('REDIS_PREFIX'),
    });
    this.on('error', async (error) => {
      this.logger.error(error);
    });
  }
}
