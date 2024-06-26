/**
 * @time 2022/5/9 13:56
 * @author xiaoqinvar
 * @desc 常用字符串、数字工具类、常用正则表达式
 * @dependence
 */

/**
 * 随机字符串，总长度11个字符
 * @param num 11 - num数 = 返回的总长度
 */
export function randomString(num = 0): string {
  return Math.random().toString(36).split('.')[1].slice(num);
}

/**
 * 从payload中挑选出属于payload的字段
 * @param payload
 * @param keys payload的字段集合
 */
export function pick<T, Key extends keyof T>(
  payload: T,
  keys: Key[],
): Pick<T, Key> {
  const res: any = {};
  for (const key of keys) {
    res[key] = payload[key];
  }
  return res as Pick<T, Key>;
}

/**
 * 排除keys中的字段
 * @param payload
 * @param keys
 * @returns
 */
export function exclude<T, Key extends keyof T>(
  payload: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete payload[key];
  }
  return payload;
}
