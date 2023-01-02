/**
 * @Description: 响应体VO
 * @Author: 小钦var
 * @Date: 2023/1/2 17:51
 */
export default class Res {
  constructor(data: any, message: string, code: number) {}

  static success(data: any, message = "ok🚀", code = 1) {
    return new Res(data, message, code);
  }

  static error(message: string, code = 0) {
    return new Res(null, message, code);
  }
}
