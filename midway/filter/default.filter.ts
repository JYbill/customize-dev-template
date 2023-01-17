import { Catch } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";
import Res from "../vo/res.vo";

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    return Res.error();
  }
}
