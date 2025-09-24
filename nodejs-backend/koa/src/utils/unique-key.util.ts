import moment from "moment";

import { HttpError } from "#error/index.ts";
import { queryOne } from "#lib/database.ts";
import { Nanoid } from "#lib/nanoid/index.ts";
import { GlobalRedis as redisClient } from "#lib/redis/index.ts";

interface UniqueKeyGenerateOptions {
  dbTable: string;
  fieldKey: string;
  length: number;
  prefix?: string;
  timeFormat?: string | null;
  maxAttempts?: number;
  logger?: Console;
  redisTTL?: number;
  lockTTL?: number;
}

/**
 * 生成数据库和Redis双重唯一性保证的随机键
 * @ param {UniqueKeyGenerateOptions} options - 配置选项
 * @ returns {Promise<string>} 唯一键
 * @ throws {Error} 生成失败时抛出错误
 */
export const generateUniqueKey = async ({
  dbTable,
  fieldKey,
  length,
  prefix = "",
  timeFormat = null,
  maxAttempts = 10,
  logger = console,
  redisTTL = 2,
  lockTTL = 2,
}: UniqueKeyGenerateOptions): Promise<string> => {
  const redisKeyPrefix = `uuid:`;

  try {
    logger.log("开始生成随机 key...");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let keyValue = prefix;

      // 添加时间戳（如果设置了时间格式）
      if (timeFormat) {
        const currentTimeStr = moment().format(timeFormat);
        keyValue += currentTimeStr;
      }

      // 添加随机数字
      keyValue += Nanoid.UrlAlphabetNanoid(length);
      logger.log(`尝试第 ${attempt} 次: 检查 key 是否存在 -> ${keyValue}`);

      const redisKey = `${redisKeyPrefix}${keyValue}`;
      const lockKey = `lock:${redisKey}`;

      // 1. 先尝试获取临时锁，确保并发安全
      const lockAcquired = await redisClient.set(lockKey, "1", "EX", lockTTL, "NX");
      if (!lockAcquired) {
        logger.warn(`key ${keyValue} 正在被其他进程检查，跳过...`);
        continue;
      }

      try {
        // 2. 检查Redis中是否已存在最终记录
        const existsInRedis = await redisClient.exists(redisKey);
        if (existsInRedis) {
          logger.warn(`key 在Redis中已存在: ${keyValue}，重新生成...`);
          continue;
        }

        // 3. 检查数据库
        const existsInDB = await queryOne(`SELECT 1 FROM ${dbTable} WHERE ${fieldKey} = ?`, [
          keyValue,
        ]);
        if (existsInDB) {
          logger.warn(`key 在数据库中已存在: ${keyValue}，重新生成...`);
          continue;
        }

        // 4. 如果都不存在，则设置最终的Redis记录并返回结果
        logger.log(`找到可用 key: ${keyValue}`);
        await redisClient.set(redisKey, "1", "EX", redisTTL);
        logger.log(`key已写入Redis，过期时间: ${redisTTL}秒`);

        return keyValue;
      } finally {
        // 无论成功失败，都删除临时锁
        await redisClient.del(lockKey);
      }
    }

    logger.error(`在 ${maxAttempts} 次尝试后，未能生成唯一的 key`);
    throw HttpError.throwServerError(
      `There was an error in generating the key. Please try again later`,
    );
  } catch (error) {
    logger.error("生成唯一key过程中发生错误:", error);
    throw HttpError.throwServerError(
      `An error occurred during the process of generating the unique key`,
    );
  }
};
