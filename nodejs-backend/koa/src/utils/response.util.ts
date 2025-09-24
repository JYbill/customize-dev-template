import type { Context } from "koa";

import { MessageSymbol } from "#enum/symbol.enum.ts";
import { ErrorCode, HTTPStatus } from "#error/index.ts";

/**
 * @Description: 结构化响应内容
 * @Date: 2024/6/26 9:53
 */
export default class ResponseUtil {
  code: number;
  data: Record<string, any> | null;
  message: string;

  constructor(data: Record<string, any> | null, message: string, code: number) {
    this.data = data;
    this.message = message;
    this.code = code;
  }

  static returnObject(res: ResponseUtil) {
    return {
      code: res.code,
      data: res.data ?? null,
      message: res.message,
    };
  }

  static success(
    data: Record<string, any> | null,
    message: string = "✅ ok",
    code: number = HTTPStatus.OK,
  ) {
    const res = new ResponseUtil(data, message, code);
    const ret = ResponseUtil.returnObject(res);
    return ret;
  }

  static error(
    message: string = "⚠️ sever error, pls concat the administrator!",
    code: number = ErrorCode.UNCATCH_ERROR,
    errorData: Record<string, any> | null = null,
  ) {
    const res = new ResponseUtil(errorData, message, code);
    return ResponseUtil.returnObject(res);
  }
}

/**
 * 工具：返回响应描述，而不返回数据
 * @param ctx
 * @param message
 */
export const sendMessageInfo = (ctx: Context, message: string) => {
  ctx.body = {
    [MessageSymbol]: message,
  };
};
