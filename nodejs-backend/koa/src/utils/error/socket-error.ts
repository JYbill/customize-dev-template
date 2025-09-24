import type { AppSocket } from "#types/library.d.ts";

import { SocketErrorCode } from "./error-code.ts";

/**
 * 面向对象的 Socket.IO 服务端异常抛出类
 * 直接 throw new SocketError(socket, code, data) 即可
 */
export class SocketError extends Error {
  code: number;
  data: Record<string, any> | null;

  constructor(
    socket: AppSocket,
    code: number = SocketErrorCode.UNKNOWN_ERROR,
    message: string,
    data: Record<string, any> | null = null,
  ) {
    super();
    this.code = code;
    this.data = data;
    this.message = message;
    // 自动向客户端抛出异常事件
    socket.emit("error", {
      code,
      message,
      data,
    });
  }
  static throwForbiddenError(socket: AppSocket, message: string, data = null) {
    return new SocketError(socket, SocketErrorCode.FORBIDDEN, message, data);
  }
  static throwUnauthorizedError(socket: AppSocket, message: string, data = null) {
    return new SocketError(socket, SocketErrorCode.UN_AUTHENTICATION, message, data);
  }

  static throwRequestError(socket: AppSocket, message: string, data = null) {
    return new SocketError(socket, SocketErrorCode.FRONT_PARAMS, message, data);
  }
}
