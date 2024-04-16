import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { NextFunction, Request, Response } from 'express';

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
    res.on('finish', () => {
      const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const method = req.method;
      const uri = req.originalUrl;
      const spend = Date.now() - start;
      const logMessage = `[${method}] ${date} URI=${uri} spend=${spend}ms pass=${
        req.pass !== false
      }`;
      this.logger.log(logMessage);
    });
    next();
  }
}
