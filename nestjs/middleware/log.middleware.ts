import { Injectable, Logger } from "@nestjs/common";
import { format } from "date-fns";
import { NextFunction, Request, Response } from "express";

/**
 * @Description: 日志中间件
 * @Author: 小钦var
 * @Date: 2023/10/12 11:03
 */
@Injectable()
export default class LoggerMiddleware {
  private readonly logger: Logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
      const date = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const method = req.method;
      const uri = req.originalUrl;
      const spend = Date.now() - start;
      let logMessage = `[${method}] ${date} URI=${uri} spend=${spend}ms pass=${
        req.pass !== false
      }`;
      if (req.isAuthenticated?.()) {
        logMessage = `${req.user.userID} ` + logMessage;
      }
      this.logger.log(logMessage);
    });
    next();
  }
}
