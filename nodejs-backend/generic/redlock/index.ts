import { Redlock, ResourceLockedError } from "@sesamecare-oss/redlock";

import { redlockRedis } from "#lib/redis/redlock.ts";
import { globalLogger } from "#logger";

const logger = globalLogger.child({ fileFlag: "#lib/redlock" });

const RedisRedlock = new Redlock([redlockRedis]);
RedisRedlock.on("error", (err) => {
  if (err instanceof ResourceLockedError) return;
  logger.error("redlock error", err);
});

export { RedisRedlock };
