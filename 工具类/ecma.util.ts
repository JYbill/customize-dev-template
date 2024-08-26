/**
 * @time 2022/5/9 13:56
 * @author xiaoqinvar
 * @desc 常用字符串、数字工具类、常用正则表达式
 * @dependence
 */

import * as jose from "jose";
import type { JWTPayload } from "jose";

/**
 * 原始类型
 */
export type TPrimitive = number | string | boolean;

// input accept参数,允许上传audio video image ppt pdf excel doc ...
export const inputAccept =
  "audio/*,video/*,image/*,.csv,text/plain,application/vnd.ms-excel,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// 获取url中图片名称的正则匹配
export const imgFilenameRex = /\w+\.(png|jpg|jpeg|svg|webp|gif|ico)/i;

export class EcmaUtil {
  // 正则：匹配所有
  static readonly MathAllRxp = /.*.*/gi;
  static readonly PhoneRxp = /^1[34578]\d{9}$/;

  /**
   * 随机获取UUID
   * @returns string
   */
  static uuid() {
    return "xxxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 日期格式化
   * @param fmt
   * @param date
   * @returns
   */
  static dateFormat(fmt: string, date: Date) {
    date = new Date(date);

    let ret;
    const opt: Record<string, string> = {
      "Y+": date.getFullYear().toString(), // 年
      "m+": (date.getMonth() + 1).toString(), // 月
      "d+": date.getDate().toString(), // 日
      "H+": date.getHours().toString(), // 时
      "M+": date.getMinutes().toString(), // 分
      "S+": date.getSeconds().toString(), // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(
          ret[1],
          ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
        );
      }
    }
    return fmt;
  }

  /**
   * 使用Ecmascript默认的时间处理格式化, 最后得到的数据是: 2022/2/23 15:38:46, 需要进一步可以转换自己
   * @param date 日期、时间戳
   * @param option 没有使用默认的, 有用自己的
   * @returns
   */

  static dateFormatByEcma(
    date: Date | number,
    option?: Intl.DateTimeFormatOptions
  ) {
    return option
      ? new Intl.DateTimeFormat("zh-CN", option).format(date)
      : new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(date);
  }

  /**
   * 文件名获取随机文件名  abc.jpg => abc_89dac30047f7.jpg
   * @param filename
   * @returns
   */
  static randomFileName(filename: string): string {
    const separator = ".";
    const fileNameArr: Array<string> = filename.split(separator);
    return fileNameArr[0] + "_" + this.uuid() + "." + fileNameArr[1];
  }

  /**
   * 获取前一天和后一天的时间戳
   * @returns [昨天0点时间戳, 明天0点时间戳]
   */
  static getBeforeAndAfterTime(date: Date = new Date()): number[] {
    const before = date;
    before.setMinutes(0);
    before.setSeconds(0);
    before.setMilliseconds(0);
    before.setUTCHours(0);
    const after = new Date(before);
    after.setDate(after.getDate() + 1);
    return [+new Date(before), +new Date(after)];
  }

  /**
   * 随机字符串，总长度11个字符
   * @param num 11 - num数 = 返回的总长度
   */
  static randomString(num = 0): string {
    return Math.random().toString(36).split(".")[1].slice(num);
  }

  /**
   * 防抖函数
   * @param func 回调函数callback
   * @param delay 延迟时间ms
   * @returns
   */
  static debounce(func: (arg: TPrimitive[]) => void, delay: number) {
    // 起始时间戳
    let startTimeStamp = 0;
    // 定时器
    let timer: NodeJS.Timeout | null = null;
    return (...arg: TPrimitive[]) => {
      // 当前的时间戳
      const nowTimeStamp = +new Date();

      if (nowTimeStamp - startTimeStamp >= delay) {
        // 校验 - 允许执行
        console.log("立即执行时间", new Date().getSeconds());
        // 执行函数
        func.call(func, arg);
        // 继续初始化下一个运行立即执行的时间戳
        startTimeStamp = +new Date();
      } else {
        // 校验 - 不允许执行，且重置结束时间戳
        clearTimeout(timer as NodeJS.Timeout);
        // 重置定时器
        timer = setTimeout(() => {
          console.log("定时器执行时间", new Date().getSeconds());
          func.call(func, arg);
          clearTimeout(timer as NodeJS.Timeout);
          startTimeStamp = +new Date();
        }, delay);
        startTimeStamp = +new Date();
      }
    };
  }

  /**
   * 节流函数
   * @param func 回调函数
   * @param time 延迟ms
   */
  // 定时器
  private static timer: NodeJS.Timeout | null;
  static throttle(
    time: number,
    func: (args: TPrimitive[]) => void,
    ...args: TPrimitive[]
  ): void {
    if (!EcmaUtil.timer) {
      console.log("允许执行", new Date().getMilliseconds());
      // 执行到这里说明没有定时器, 执行并添加定时器
      func.call(this, args);
      EcmaUtil.timer = setTimeout(() => {
        // 清空定时器
        clearTimeout(EcmaUtil.timer as NodeJS.Timeout);
        EcmaUtil.timer = null;
      }, time);
    }
    console.log("节流中...", new Date().getMilliseconds());
  }

  /**
   * 混合数字、字符串
   */
  static randomNumberAndString() {
    return Math.random().toString(16).slice(2, 10);
  }

  /**
   * 获取随机纯数字字符串，第一个数组如果为0则用1代替
   * @param length 长度
   */
  static randomNumberString(length: number): string {
    const numberStr = Math.random()
      .toString()
      .slice(2, length + 2);
    return numberStr.startsWith("0") ? "1" + numberStr.slice(1) : numberStr;
  }

  /**
   * 解析jwt并返回解析结果
   * @param token 完整token数据
   * @param authHeader Auth: Barber字段
   * @returns
   */
  static parseJWT(token: string, authHeader = "bearer"): JWTPayload {
    if (token.length <= 1) {
      throw new Error("token is null.");
    }
    let jwtString: string = token;
    // 存在authHeader即去除authHeader
    if (jwtString.includes(authHeader)) {
      jwtString = token.replace(authHeader, "");
    }

    const payload = jose.decodeJwt(jwtString);
    return payload;
  }

  /**
   * ES2020 String.prototype.replaceAll方法的替代方案
   * 替换全部
   * @param target
   * @param targetStr
   * @param replaceStr
   */
  static replaceAll(target: string, targetStr: string, replaceStr: string) {
    return target.split(targetStr).join(replaceStr);
  }
}

/**
 * 递归深克隆（支持日期、数组、正则）
 * @param obj
 * @return {RegExp|*|*[]|{}|Date}
 */
export function deepClone(obj) {
  // 当null NaN undefined number string等基本数据类型时直接返回
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // HTML元素
  if (obj instanceof HTMLElement) {
    return obj.cloneNode(true);
  }
  // Date类型
  if (obj instanceof Date) {
    const copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  // 正则类型类型
  if (obj instanceof RegExp) {
    const Constructor = obj.constructor as new (arg: any) => any;
    return new Constructor(obj);
  }
  // 如果是数组等引用数据类型
  if (obj instanceof Array || obj instanceof Object) {
    const copyObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copyObj[key] = this.deepClone(obj[key]);
      }
    }
    return copyObj;
  }
}

/**
 * 忽略所有并行的Promise，只返回最后一个
 * @param fn
 * @returns
 */
export function onlyResolvesLast(fn) {
  // 利用闭包保存最新的请求 id
  let id = 0;

  const wrappedFn = (...args) => {
    // 发起请求前，生成新的 id 并保存
    const fetchId = id + 1;
    id = fetchId;

    // 执行请求
    const result = fn.apply(this, args);

    return new Promise((resolve, reject) => {
      // result 可能不是 promise，需要包装成 promise
      Promise.resolve(result).then(
        (value) => {
          // 只处理最新一次请求
          if (fetchId === id) {
            resolve(value);
          }
        },
        (error) => {
          // 只处理最新一次请求
          if (fetchId === id) {
            reject(error);
          }
        }
      );
    });
  };

  return wrappedFn;
}

/**
 * 文件二进制转Blob二进制对象
 * @param base64 文件的Base64字符串
 * @returns { Blob } 二进制对象
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(";"); // base64文件首部
  const mime = parts[0].split(":")[1]; // 类型
  const raw = atob(parts[1].split(",")[1]); // 主体
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  const blob = new Blob([uInt8Array], { type: mime });
  return blob;
}

/**
 * vite下通过URL获取图片地址，支持构建后产出该图片
 * @param name
 * @returns
 */
export const getImg = (name: string): URL => {
  const url = new URL(`../assets/images/${name}.png`, import.meta.url);
  return url;
};

/**
 * 安全判断是否是奇数
 * @param n
 * @returns
 */
export const isOdd = (n: number) => {
  return n % 2 === 1 || n % 2 === -1;
};

import streamSaver from "streamsaver";

type OversizeFileDownloadOption = {
  url: string;
  processHandler?: () => void;
  limitSize?: number;
};
type DownloadInfo = {
  res: Response;
  reader: ReadableStreamDefaultReader;
  filename: string;
  size: number;
  fileTotalSize: number;
  contentLength: number;
};

/**
 * 排除keys中的字段
 * @param payload
 * @param keys
 * @returns
 */
export function exclude<T, Key extends keyof T>(
  payload: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    delete payload[key];
  }
  return payload;
}

/**
 * 将数组中包含keys相关的字段排除
 * @param payloadList
 * @param keys
 * @returns
 */
export function excludeAll<T, Key extends keyof T>(
  payloadList: T[],
  keys: Key[]
): Omit<T, Key>[] {
  for (const payload of payloadList) {
    for (const key of keys) {
      delete payload[key];
    }
  }
  return payloadList;
}

/**
 * 从payload中挑选出属于payload的字段
 * @param payload
 * @param keys payload的字段集合
 */
export function pick<T, Key extends keyof T>(
  payload: T,
  keys: Key[]
): Pick<T, Key> {
  const res: any = {};
  for (const key of keys) {
    res[key] = payload[key];
  }
  return res as Pick<T, Key>;
}

/**
 * 路径转http访问的uri路径
 * @example
 * ```ts
 * // nestjs中根据ASSETS_PREFIX访问前缀拼接成uri
 * path2URI(
        this.configService.get('ASSETS_PREFIX'),
        assetsSysFilePath,
      );
 * ```
 * @param assetsPrefix
 * @param path
 */
export function path2URI(assetsPrefix: string, path: string): string {
  let uri = path;
  const assetsStr = "assets/";
  uri = uri.replaceAll("\\", "/");
  uri = uri.slice(uri.indexOf(assetsStr) + assetsStr.length);
  uri = assetsPrefix + uri;
  return uri;
}

/**
 * 根据a, b两经纬度计算球面距离(地球面)
 */
export function calcDistance(a, b) {
    let ax: number | undefined;
    let ay: number | undefined;
    let bx: number | undefined;
    let by: number | undefined;
    for (const key in a) {
        if (!ax) {
            ax = a[key] * (Math.PI / 180);
        } else if (!ay) {
            ay = a[key] * (Math.PI / 180);
        }
    }
    for (const key in b) {
        if (bx == null) {
            bx = b[key] * (Math.PI / 180);
        
        } else if (by == null) {
            by = b[key] * (Math.PI / 180);
    
        }
        
    }

    if (!ax || !ay || !bx || !by) throw new Error('a, b参数错误, 请检查！')

    const sin_x1 = Math.sin(ax), cos_x1 = Math.cos(ax);
    const sin_y1 = Math.sin(ay), cos_y1 = Math.cos(ay);
    const sin_x2 = Math.sin(bx), cos_x2 = Math.cos(bx);
    const sin_y2 = Math.sin(by), cos_y2 = Math.cos(by);
    const cross_prod = cos_y1 * cos_x1 * cos_y2 * cos_x2 + cos_y1 * sin_x1 * cos_y2 * sin_x2 + sin_y1 * sin_y2;
    if (cross_prod >= 1 || cross_prod <= -1) {
        if (!(Math.abs(cross_prod) - 1 < 0.000001)) {
            return false;
        }
        return cross_prod > 0 ? 0 : Math.PI;
    }
    return Math.acos(cross_prod);
}

/**
 * 根据num参数分割数组为二维数组
 * @param list 
 * @param num 默认10个一组
 * @returns 
 */
export function groupByNum(list: any[], num: number = 10) {
    const expireGroups = [];
    let per10 = [];
    const n = list.length;
    for (let i = 0; i < n; i++) {
      const el = list[i].valueOf();
      if (i !== 0 && i % num === 0) {
        expireGroups.push(per10);
        per10 = [el];
        continue;
      } else if (i === n - 1) {
        per10.push(el);
        expireGroups.push(per10);
        continue;
      }
      per10.push(el);
    }
    return expireGroups;
  }