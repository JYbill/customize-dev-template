import { GlobalRedis } from "#lib/redis/index.js";

export const RedisStore = {
  async get(key) {
    const session = await GlobalRedis.get(key);
    return JSON.parse(session);
  },
  async set(key, value, maxAge, { changed, ctx, rolling }) {
    try {
      const exist = await GlobalRedis.exists(key);
      if (!exist) {
        // 新建操作
        const result = await GlobalRedis.psetex(
          key,
          maxAge,
          JSON.stringify(value),
        );
        return result;
      }
      // 更新操作
      const ms = await GlobalRedis.pttl(key);
      // 此时session已过期TTL被清理，不做任何操作
      if (ms <= 0) {
        return;
      }
      // 🚨 务必保证TTL的原子性，否则会出现意外过期的错误
      const result = await GlobalRedis.psetex(key, ms, JSON.stringify(value));
      return result;
    } catch (err) {
      // 意外错误兜底
      logger.error("key: %s, maxAge: %s", key, maxAge);
      logger.error("session store error: %s", err);
      throw err;
    }
  },
  async destroy(key, { ctx }) {
    const affected = await GlobalRedis.del(key);
    return affected;
  },
};
