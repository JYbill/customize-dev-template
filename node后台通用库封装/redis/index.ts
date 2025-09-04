import { Redis, type RedisOptions } from "ioredis";

import { config } from "#config";

import { globalLogger } from "#logger";
import { ping } from "#utils/app.util.ts";

const logger = globalLogger.child({ fileFlag: "redis/index.js" });
const redisConfig = { ...config.redisConn, keyPrefix: "wzj:" } as RedisOptions;
const client = new Redis(redisConfig);

client
  .on("error", function (err) {
    logger.error(err);
  })
  .on("reconnecting", function (why: Error) {
    logger.error("[default] reconnecting %s Date: %s", why, new Date().toLocaleString());
  })
  .on("ready", function () {
    logger.info("[default] Redis Is Ready!");
    ping(client);
  });

export { client as GlobalRedis };
