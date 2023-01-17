import Res from "../vo/res.vo";

import { HttpStatus, MidwayHttpError } from "@midwayjs/core";
import { UnauthorizedError } from "@midwayjs/core/dist/error/http";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

@Catch(UnauthorizedError)
export default class UnAuthorizedFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.logger.error(err);
    ctx.status = HttpStatus.UNAUTHORIZED;
    ctx.body = Res.error("403 认证失败或未授权");
  }
}
