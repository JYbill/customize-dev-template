import { GlobalRedis } from "#lib/redis/index.js";

export const RedisStore = {
  async get(key) {
    const session = await GlobalRedis.get(key);
    return JSON.parse(session);
  },
  async set(key, value, maxAge, { rolling, changed, ctx }) {
    const result = await GlobalRedis.setex(key, maxAge, JSON.stringify(value));
    return result;
  },
  async destroy(key, { ctx }) {
    const affected = await GlobalRedis.del(key);
    return affected;
  },
};
