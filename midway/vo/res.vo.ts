/**
 * @Description: 响应体VO
 * @Author: 小钦var
 * @Date: 2023/1/2 17:51
 */
export default class Res {
  constructor(private data: any, private message: string, private code: number) {}

  static success(data: any, message = "ok 🚀", code = 1) {
    return new Res(data, message, code);
  }

  static error(message = "出错了❗️", code = 0) {
    return new Res(null, message, code);
  }
}
