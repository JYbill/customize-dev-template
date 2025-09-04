import { Global, Injectable, Logger, Module } from "@nestjs/common";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Redlock } from "@sesamecare-oss/redlock";

@Injectable()
export class RedlockService extends Redlock {
  readonly redLock: Redlock;
  private readonly logger = new Logger(RedlockService.name);
  constructor(private readonly redisService: RedisService) {
    super([redisService.getOrThrow()]);
    this.on("error", (err) => {
      this.logger.error("redlock error", err);
    });
  }
}

@Global()
@Module({
  providers: [RedlockService],
  exports: [RedlockService],
})
export class RedlockModule {}
