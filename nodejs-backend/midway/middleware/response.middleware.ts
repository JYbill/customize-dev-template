import Res from "../vo/res.vo";

import { HttpStatus, IMiddleware } from "@midwayjs/core";
import { Middleware } from "@midwayjs/decorator";
import { Context, NextFunction } from "@midwayjs/koa";

@Middleware()
export class ResponseMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      ctx.status = HttpStatus.OK;
      const data = await next();
      return Res.success(data);
    };
  }

  static getName(): string {
    return "report";
  }
}
