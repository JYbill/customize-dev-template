import { IMiddleware } from "@midwayjs/core";
import { Middleware } from "@midwayjs/decorator";
import { Context, NextFunction } from "@midwayjs/koa";

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      const result = await next();
      const rt = Date.now() - startTime; // 耗时ms
      ctx.logger.info(`rt = ${rt}ms`);
      return result;
    };
  }

  static getName(): string {
    return "report";
  }
}
