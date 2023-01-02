import Res from "../vo/res.vo";

import { ILogger } from "@midwayjs/core";
import { Inject, Logger } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

export default class BaseController {
  @Inject()
  ctx: Context;

  @Logger()
  logger: ILogger;

  /**
   * 响应成功对象
   * @param data
   * @param message
   * @param code
   */
  success(data: any, message?: string, code?: number) {
    return Res.success(data, message, code);
  }

  /**
   * 响应错误对象
   * @param message
   * @param code
   */
  error(message: string, code?: number) {
    return Res.error(message, code);
  }
}
