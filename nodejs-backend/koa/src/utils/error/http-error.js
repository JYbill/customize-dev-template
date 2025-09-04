import { ErrorCode, HTTPStatus } from "#error/index.js";

export class HttpError extends Error {
  constructor(status, msg, code = ErrorCode.UNKNOWN_ERROR, data = null) {
    super();
    this.status = status;
    this.message = msg;
    this.code = code;
    this.data = null;
  }

  /**
   * 前端请求错误
   * @param msg
   * @param code
   * @param status
   * @param data
   * @return {HttpError}
   */
  static throwRequestError(
    msg,
    code = ErrorCode.FRONT_PARAMS,
    status = HTTPStatus.BAD_REQUEST,
    data = null,
  ) {
    return new HttpError(status, msg, code, data);
  }

  static throwServerError(
    msg,
    code = ErrorCode.UNCATCH_ERROR,
    status = HTTPStatus.INTERNAL_SERVER_ERROR,
    data = null,
  ) {
    return new HttpError(status, msg, code, data);
  }
}
