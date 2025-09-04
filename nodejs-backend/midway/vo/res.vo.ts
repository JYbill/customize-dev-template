/**
 * @Description: 响应体VO
 * @Author: 小钦var
 * @Date: 2023/1/2 17:51
 */
class ResponseUtil<T> {
  constructor(private data: T, private message: string, private code: number) {}

  static success<T>(data: T, message = "ok", code = 1) {
    return new ResponseUtil(data, message, code);
  }

  static error(message = "服务器错误", code = 0) {
    return new ResponseUtil<null>(null, message, code);
  }
}
