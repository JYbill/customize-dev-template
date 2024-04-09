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
          ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"),
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

  static dateFormatByEcma(date: Date | number, option?: Intl.DateTimeFormatOptions) {
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
  static throttle(time: number, func: (args: TPrimitive[]) => void, ...args: TPrimitive[]): void {
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
        },
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
  url: string, processHandler?: () => void, limitSize?: number
}
type DownloadInfo = {
  res: Response,
  reader: ReadableStreamDefaultReader,
  filename: string,
  size: number,
  fileTotalSize: number,
  contentLength: number,
}

/**
 * 超大文件二进制下载器
 */
export class OversizeFileDownloader {
  url;
  limitSize;
  processHandler; // 进度钩子
  processLastTime = 0; // 进度钩子最后一次执行的时间

  // 下面数据结束后需要重置
  isDownload = false; // 是否正在下载
  fileTotalSize = 0; // 总二进制大小（字节）
  filename = ""; // 文件名
  bufferPos = 0; // 已下载字节大小
  constructor(options: OversizeFileDownloadOption) {
    const { url, processHandler, limitSize = 1024 * 1024 * 1024 } = options;
    if (!url) {
      throw TypeError("url is must")
    }
    this.url = url;
    this.limitSize = limitSize; // 默认1G
    if (!processHandler) {
      this.processHandler = function(this: OversizeFileDownloader) {
        console.log("progress", (this.bufferPos / this.fileTotalSize * 100).toFixed(2) + "%");
      }
    } else {
      this.processHandler = processHandler;
    }
  }

  /**
   * 下载核心处理
   */
  async downloadCore() {
    if (this.isDownload) {
      console.warn("downloader is running, pls wait 'isDownload = false'");
      return;
    }
    this.isDownload = true;
    console.log("😄 start downloading");

    const res = await this.downloadFile();
    this.filename = res.filename as string;
    this.fileTotalSize = res.fileTotalSize;
    let {reader} = res;
    const fileStream = streamSaver.createWriteStream(this.filename, { size: this.fileTotalSize })
    const writer = fileStream.getWriter();

    // 分片循环下载
    while (this.bufferPos < this.fileTotalSize) {
      let done = false; // 本次HTTP range是否写入完毕

      // 循环读取二进制并写入writeable stream
      while (!done) {
        const bufferRes = await reader!.read();
        const buffer = bufferRes.value;
        done = bufferRes.done;
        if (!done) {
          await writer.ready.then(async () => {
            await writer.write(buffer);
            this.bufferPos += buffer!.length;

            // 500ms间隔执行一次钩子（简单防抖）
            if (performance.now() - this.processLastTime >= 500) {
              this.processHandler!.call(this);
              this.processLastTime = performance.now();
            }
          })
        }
      }

      // 获取下一个range范围的二进制流
      const retryRes = await this.downloadFile(this.bufferPos);
      reader = retryRes.reader;
    }
    writer.ready.then(() => {
      writer.close();
    })
    writer.closed.then(() => {
      this.processHandler!.call(this);
      console.log("✅ 下载完毕");
      this.resetState();
    })
  }

  resetState() {
    this.isDownload = false;
    this.fileTotalSize = 0;
    this.filename = "";
    this.bufferPos = 0;
    this.processLastTime = 0;
  }

  /**
   * HTTP Range下载文件二进制
   * @param startPos
   */
  async downloadFile(startPos = 0) {
    const endPos = this.limitSize + startPos;
    const res = await fetch(this.url, {
      method: "GET",
      headers: {
        'Range': `bytes=${startPos}-${endPos}`
      }
    })
    let contentDisposition = res.headers.get("Content-Disposition")!;
    contentDisposition = contentDisposition.split("filename=")[1];
    contentDisposition = contentDisposition.replaceAll(`"`, '');
    const size = Number(res.headers.get("Content-Length"));
    const fileTotalSize = Number(res.headers.get('File-Total-Size'));
    const contentLength = Number(res.headers.get('Content-Length'));
    const result: DownloadInfo =  {
      res,
      reader: res.body!.getReader(),
      filename: contentDisposition,
      size,
      fileTotalSize,
      contentLength
    };
    return result;
  }
}
