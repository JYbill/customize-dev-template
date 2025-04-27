import { Server } from "socket.io";

import { CourseWSController } from "#app/ws/course.js";

export class SocketIOContainer {
  io = null;

  /**
   * 初始化socket.io，基于相同HTTP服务的TCP端口
   * @param httpServer
   */
  static init(httpServer) {
    const io = new Server(httpServer, {});

    CourseWSController.router(io); // 课堂WS路由

    this.io = io;
  }
}
