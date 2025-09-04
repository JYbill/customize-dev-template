import { MessageSymbol } from "#enum/symbol.enum.js";

/**
 * @Description: 结构化响应内容
 * @Date: 2024/6/26 9:53
 */
export default class ResponseUtil {
  code;
  data;
  message;

  constructor(data, message, code) {
    this.data = data;
    this.message = message;
    this.code = code;
  }

  static returnObject(res) {
    return {
      code: res.code,
      data: res.data ?? null,
      message: res.message,
    };
  }

  static success(data, message = "✅ ok", code = 200) {
    const res = new ResponseUtil(data, message, code);
    const ret = ResponseUtil.returnObject(res);
    return ret;
  }

  static error(
    message = "⚠️ sever error, pls concat the administrator!",
    code = 400,
  ) {
    const res = new ResponseUtil(null, message, code);
    return ResponseUtil.returnObject(res);
  }
}

/**
 * 工具：返回响应描述，而不返回数据
 * @param ctx
 * @param message
 */
export const sendMessageInfo = (ctx, message) => {
  ctx.body = {
    [MessageSymbol]: message,
  };
};
