import { Redis, type RedisOptions } from "ioredis";

import { config } from "#config";

import { globalLogger } from "#logger";
import { ping } from "#utils/app.util.ts";

const logger = globalLogger.child({ fileFlag: "redis/redlock" });
const redisConfig = { ...config.redisConn, keyPrefix: "wzj:lock:" } as RedisOptions;
const client = new Redis(redisConfig);

client
  .on("error", function (err) {
    logger.error(err);
  })
  .on("reconnecting", function (why: Error) {
    logger.error("[redlock] reconnecting %s Date: %s", why, new Date().toLocaleString());
  })
  .on("ready", function () {
    logger.info("[redlock] Redis Is Ready!");
    ping(client);
  });

export { client as redlockRedis };
