import { Injectable, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/**
 * @Description: 日志中间件
 * @Author: 小钦var
 * @Date: 2024/4/16 9:06
 */
@Injectable()
export default class LoggerMiddleware {
  private readonly logger: Logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
      const method = req.method;
      const statusCode = res.statusCode;
      const referer = req.get("Referer");
      const uri = req.originalUrl;
      const spend = Date.now() - start;
      const reqIP = req.ip || req.ips[0]; // 首先信任代理头，其次信任连接IP，如果无代理则命中socket.remote.ip
      const logMessage = `[${method}:${statusCode}] ${reqIP} | referer=${referer || ""} | URI=${uri} | spend=${spend}ms | pass=${req.pass !== false}`;
      if (req.pass !== false) {
        this.logger.log(logMessage);
      } else {
        this.logger.error(logMessage);
      }

      // 30x 重定向日志
      if ([301, 302].includes(statusCode)) {
        this.logger.log(`[${method}] [${statusCode}] Redirect URL: ${res.getHeader("location")}`);
      }
    });
    next();
  }
}
