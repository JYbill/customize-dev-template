import Res from "../vo/res.vo";

import { HttpStatus, MidwayError, MidwayHttpError, httpError } from "@midwayjs/core";
import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

export class ProjectError extends MidwayError {}

@Catch(ProjectError)
export class ProjectErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    ctx.status = HttpStatus.BAD_REQUEST;
    ctx.body = Res.error(err.message);
  }
}
