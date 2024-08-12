import { GlobalRedis } from "#lib/redis/index.js";

export const RedisStore = {
  async get(key) {
    const session = await GlobalRedis.get(key);
    return JSON.parse(session);
  },
  async set(key, value, maxAge, { changed, ctx, rolling }) {
    if (ctx.session.isNew) {
      // 新建操作
      return await GlobalRedis.psetex(key, maxAge, JSON.stringify(value));
    }
    // 更新操作
    const ms = await GlobalRedis.pttl(key);
    // 🚨 务必保证TTL的原子性，否则会出现意外过期的错误
    const result = await GlobalRedis.psetex(key, ms, JSON.stringify(value));
    return result;
  },
  async destroy(key, { ctx }) {
    const affected = await GlobalRedis.del(key);
    return affected;
  },
};
