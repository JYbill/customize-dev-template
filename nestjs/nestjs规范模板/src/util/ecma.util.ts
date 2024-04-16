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
