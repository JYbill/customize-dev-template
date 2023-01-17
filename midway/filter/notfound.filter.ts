import Res from "../vo/res.vo";

import { HttpStatus, MidwayHttpError, httpError } from "@midwayjs/core";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.status = HttpStatus.NOT_FOUND;
    ctx.body = Res.error("404 Not Found");
  }
}
