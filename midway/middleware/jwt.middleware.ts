import { JwtStrategy } from "../strategy/jwt.strategy";

import { Config, Middleware } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";
import { AuthenticateOptions, PassportMiddleware } from "@midwayjs/passport";

/**
 * midway官网示例
 */
@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware(JwtStrategy) {
  @Config("jwtMiddlewareWhiteList")
  ignoreWhiteList: string[];

  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }

  /**
   * 忽略配置白名单
   * @param ctx
   * @returns
   */
  ignore(ctx: Context): boolean {
    return this.ignoreWhiteList.includes(ctx.path);
  }
}
