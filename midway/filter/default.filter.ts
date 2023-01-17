import Res from "../vo/res.vo";

import { HttpStatus } from "@midwayjs/core";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    ctx.logger.error(err.message);
    ctx.logger.error(err);
    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
    return Res.error();
  }
}
