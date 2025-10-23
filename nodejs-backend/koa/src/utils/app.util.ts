import { type Redis } from "ioredis";
import ms from "ms";

import { asyncLocalStorage } from "#app/library/async-local-storage/index.ts";
import type { UserPayload } from "#app/types/app.d.ts";
import type { AsyncContext } from "#app/types/library.js";
import { HttpError } from "#error/http-error.ts";
import { globalLogger } from "#logger";
import type { pingCallbackParams } from "#types/util.d.ts";

import { isFalsy } from "./lodash.util.ts";

const logger = globalLogger.child({ fileFlag: "utils/app.util.ts" });

export const ping = (client: Redis) => {
  const timeoutId = setTimeout(() => {
    client.stream.emit("error", HttpError.throwServerError("timeout"));
  }, 3000);
  client
    .ping("hello")
    .then((pong) => {
      if (pong === "hello") {
        clearTimeout(timeoutId);
      }
      setTimeout(() => {
        ping(client);
      }, ms("1h"));
    })
    .catch((err: Error) => {
      logger.error("redis ping error: %o", err);
    });
};

/**
 * 自定义钩子的轮训ping方法
 * @param data
 */
export const pingCallback = (data: pingCallbackParams) => {
  const { callback, ms = 1000 * 60 * 60 } = data;
  const timer = setTimeout(async () => {
    clearInterval(timer);
    await callback.call(data.that, data.params ?? []);
    return pingCallback(data);
  }, ms);
};

export function getCurrentUser() {
  return asyncLocalStorage.getStore()?.ctx.state.user as UserPayload;
}

export function getCurrentUserId(): number {
  const user = getCurrentUser();
  if (isFalsy(user)) throw HttpError.throwForbiddenError("用户未登录");
  return user.id;
}

/**
 * 主要用于mq异步执行任务时没有store的问题
 * @param user
 * @returns
 */
export function mockStoreUser(user: UserPayload) {
  const store = {
    ctx: {
      state: {
        user,
      },
      accountId: user.accountId,
    },
  } as unknown as AsyncContext;
  asyncLocalStorage.enterWith(store);
  return { store };
}

export function mockStoreUserId(id: number) {
  const store = {
    ctx: {
      state: {
        user: { id },
      },
    },
  } as unknown as AsyncContext;
  asyncLocalStorage.enterWith(store);
  return { store };
}

export class FormatPicExportUtil {
  static formatUrl(url: string) {
    const replaceUrl = url.replace(/^https:/, "http:");
    return `${replaceUrl}?x-oss-process=image/format,jpg`;
  }
}

export class Gis {
  /**
   * 根据经纬度计算两点距离
   * Copied from (https://cnodejs.org/topic/4f99776f407edba2146d0911)
   * @param lat1 Latitude of point.
   * @param lon1 Longtitude of point.
   * @param lat2 Latitude of ref point.
   * @param lon2 Longtitude of ref point.
   * @returns Distance of the given nodes.
   */
  static calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    // 地球长半径
    const R = 6378137;
    // 转为弧度
    const toRadians = (d) => (d * Math.PI) / 180;
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    let a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }
}

export function createHandlers<C, Levels extends readonly string[][]>(
  cls: C,
  levels: Levels,
): Record<string, any> {
  function build(prefix: string[], remaining: readonly string[][]): Record<string, any> {
    const [current, ...rest] = remaining;
    const obj: Record<string, unknown> = {};

    current.forEach((key) => {
      if (rest.length === 0) {
        // 构造驼峰函数名
        const funcName = [...prefix, key]
          .map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
          .join("");

        // 安全地访问 cls 的静态方法:
        // - 通过 Record<string, unknown> 进行索引避免隐式 any
        // - 运行时校验是否为函数，避免未实现的方法导致运行时错误
        const fnUnknown = (cls as Record<string, unknown>)[funcName];
        if (typeof fnUnknown !== "function") {
          throw new Error(`Class is missing static method: ${funcName}`);
        }
        // 将静态方法断言为返回 unknown 而非 any，避免不安全的 any 返回
        const fn = fnUnknown as (...args: unknown[]) => unknown;

        obj[key] = (...args: unknown[]): unknown => fn.apply(cls, args);
      } else {
        obj[key] = build([...prefix, key], rest);
      }
    });

    return obj;
  }

  return build([], levels);
}
