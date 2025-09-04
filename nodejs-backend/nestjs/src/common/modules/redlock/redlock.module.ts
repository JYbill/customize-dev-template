import { Global, Injectable, Logger, Module } from "@nestjs/common";
import { Redlock, ResourceLockedError } from "@sesamecare-oss/redlock";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedlockService extends Redlock {
  readonly redLock: Redlock;
  private readonly logger = new Logger(RedlockService.name);

  constructor(private readonly configService: ConfigService<IEnv>) {
    super([
      new Redis({
        host: configService.get("REDIS_HOST"),
        port: configService.get("REDIS_PORT"),
        password: configService.get("REDIS_PASSWORD"),
        keyPrefix: `${configService.get("REDIS_PREFIX")}redlock:`,
      }),
    ]);
    this.on("error", (err) => {
      if (err instanceof ResourceLockedError) return;
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
