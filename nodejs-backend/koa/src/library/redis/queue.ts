import { Redis } from "ioredis";

import { config } from "#config";

import { globalLogger } from "#logger";
import { ping } from "#utils/app.util.ts";

const logger = globalLogger.child({ fileFlag: "redis/queue.ts" });
const client = new Redis({
  ...config.redisConn,
  db: config.redisConfig.queueDbNumber,
  maxRetriesPerRequest: 8, // 最大8次重连redis
  enableOfflineQueue: false, // 关闭离线队列
});

client
  .on("error", function (err) {
    logger.error(err);
  })
  .on("reconnecting", function (why: Error) {
    logger.error("reconnecting %s Date: %s", why, new Date().toLocaleString());
  })
  .on("ready", function () {
    logger.info("Bull MQ Queue Redis Is Ready!");
    ping(client);
  });

export { client as BullMQQueueInstance };
