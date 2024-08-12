import Transport from "winston-transport";

import timers from "node:timers/promises";

/**
 * 日志上报Transport子类（目前未用到）
 */
export class ReportTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  /**
   * 支持同步异步
   * @param info
   * @param next 下一个transport
   * @return {Promise<void>}
   */
  async log(info, next) {
    console.log("开始异常上报...");
    await timers.setTimeout(500);
    console.log(info.timestamp, "错误", info.message);
    console.log("异常上报结束！");
    next();
  }
}
