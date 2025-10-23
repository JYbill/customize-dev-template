import AdminUI, { RedisStore } from "@socket.io/admin-ui";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { Server } from "socket.io";

import { config } from "#config";

import type { Server as HTTPServer } from "node:http";

import { GlobalRedis } from "#lib/redis/index.ts";
import type { AppNamespace } from "#types/library.d.ts";
import { CourseWSController } from "#ws/controller/course.ts";

import WSAuthMiddleware from "./middleware/auth.middleware.ts";

export class SocketIOContainer {
  static io?: Server;
  static courseNamespace: AppNamespace;
  /**
   * 初始化socket.io，基于相同HTTP服务的TCP端口
   * @param httpServer
   */
  static init(httpServer: HTTPServer) {
    // TODO 需要将静态资源挂载到本地，否则只能使用下面的origin访问
    const io = new Server(httpServer, {
      adapter: createAdapter(GlobalRedis),
      cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
      },
      transports: ["websocket"],
      connectionStateRecovery: {
        // 断连后允许恢复会话的最大时间窗口
        maxDisconnectionDuration: 2 * 60 * 1000,
        // 恢复时是否跳过中间件
        skipMiddlewares: true,
      },
    });

    if (config.application.isDev()) {
      // 监控面板
      AdminUI.instrument(io, {
        auth: {
          type: "basic",
          username: "admin",
          password: "$2a$10$LQUDtmw77D5FHbJMrPdOPOBXkKWR1ysdhFRZVLKosF2ZQqON2kz8m", // a1s2d3f4g5
        },
        store: new RedisStore(GlobalRedis),
      });
    }

    const courseNamespace = CourseWSController.router(io);
    // ws routers
    const routes = [io.of("/"), courseNamespace];

    // 全局中间件挂载
    for (const namespace of routes) {
      namespace.use(WSAuthMiddleware);
    }

    this.io = io;
    this.courseNamespace = courseNamespace;
  }
}
