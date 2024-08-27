import Redis from 'ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService extends Redis {
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService<IEnv>) {
    super(configService.get('REDIS_URL'), {
      keyPrefix: configService.get('REDIS_PREFIX'),
    });
    this.on('error', async (error) => {
      this.logger.error(error);
    });
  }
}
