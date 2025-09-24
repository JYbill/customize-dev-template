/**
 * @Description: bullmq worker的ioredis实例
 * @Author: 小钦var
 * @Date: 2024/7/1 16:47
 */
import { Redis } from "ioredis";

import { config } from "#config";

import { globalLogger } from "#logger";
import { ping } from "#utils/app.util.ts";

const logger = globalLogger.child({ fileFlag: "redis/worker.ts" });
const client = new Redis({
  ...config.redisConn,
  db: config.redisConfig.queueDbNumber,
  maxRetriesPerRequest: null, // 让bullmq worker保持一致重连
});

client
  .on("error", function (err) {
    logger.error(err);
  })
  .on("reconnecting", function (why: Error) {
    logger.error("reconnecting %s Date: %s", why, new Date().toLocaleString());
  })
  .on("ready", function () {
    logger.info("Bull MQ Worker Redis Is Ready!");
    ping(client);
  });

export { client as BullMQWorkerInstance };
