/**
 * @Description: 结构化响应内容
 * @Author: 小钦var
 * @Date: 2024/6/26 9:53
 */
module.exports = class ResponseUtil {
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
      data: res.data || null,
      message: res.message,
    };
  }

  static success(data, message = "✅ ok", code = 1) {
    const res = new ResponseUtil(data, message, code);
    return ResponseUtil.returnObject(res);
  }

  static error(message = "⚠️ sever error, pls concat the administrator!", code = 0) {
    const res = new ResponseUtil(null, message, code);
    return ResponseUtil.returnObject(res);
  }
};
