import { MidwayHttpError, httpError } from "@midwayjs/core";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";
import Res from "../vo/res.vo";

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.body = Res.error("404 Not Found");
  }
}
