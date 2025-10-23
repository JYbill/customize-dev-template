import { ErrorCode, HTTPStatus } from "#error/index.ts";

export class HttpError extends Error {
  status: number;
  message: string;
  code: number;
  data: Record<string, any> | Error | null;
  constructor(
    status: number,
    msg: string,
    code: number = ErrorCode.UNKNOWN_ERROR,
    data: Record<string, any> | Error | null = null,
  ) {
    super();
    this.status = status;
    this.message = msg;
    this.code = code;
    this.data = data;
  }

  /**
   * 前端请求错误
   * @param msg
   * @param code
   * @param status
   * @param data
   */
  static throwRequestError(
    msg: string,
    code: number = ErrorCode.FRONT_PARAMS,
    status: number = HTTPStatus.OK,
    data: Record<string, any> | null = null,
  ) {
    return new HttpError(status, msg, code, data);
  }

  /**
   * 前端请求错误（解构传参版本）
   * @param msg
   * @param code
   * @param status
   * @param data
   */
  static throwRequestErrorDeConstruction({
    msg,
    code = ErrorCode.FRONT_PARAMS,
    status = HTTPStatus.OK,
    data = null,
  }: {
    msg: string;
    code?: number;
    status?: number;
    data?: Record<string, any> | null;
  }) {
    return new HttpError(status, msg, code, data);
  }

  static throwServerError(
    msg: string,
    code: number = ErrorCode.UNCATCH_ERROR,
    status: number = HTTPStatus.INTERNAL_SERVER_ERROR,
    data: Record<string, any> | null = null,
  ) {
    return new HttpError(status, msg, code, data);
  }

  /**
   * 未认证
   */
  static throwUnauthorizedError(
    msg: string,
    code: number = ErrorCode.UN_AUTHENTICATION,
    status: number = HTTPStatus.UNAUTHORIZED,
    data: Record<string, any> | null = null,
  ) {
    return new HttpError(status, msg, code, data);
  }

  /**
   * 未授权
   */
  static throwForbiddenError(
    msg: string,
    code: number = ErrorCode.FORBIDDEN,
    status: number = HTTPStatus.FORBIDDEN,
    data: Record<string, any> | null = null,
  ) {
    return new HttpError(status, msg, code, data);
  }
}
