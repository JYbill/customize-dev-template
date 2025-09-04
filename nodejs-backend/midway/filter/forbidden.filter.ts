import Res from "../vo/res.vo";

import { HttpStatus, MidwayHttpError } from "@midwayjs/core";
import { ForbiddenError, UnauthorizedError } from "@midwayjs/core/dist/error/http";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

@Catch(ForbiddenError)
export default class UnAuthorizedFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.logger.error(err);
    ctx.status = HttpStatus.FORBIDDEN;
    ctx.body = Res.error("授权失败");
  }
}
