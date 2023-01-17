import { JwtStrategy } from "../strategy/jwt.strategy";

import { Config, Middleware } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";
import { AuthenticateOptions, PassportMiddleware } from "@midwayjs/passport";

/**
 * midway官网示例
 */
@Middleware()
export class JwtPassportMiddleware extends PassportMiddleware([JwtStrategy]) {
  @Config("jwtMiddlewareWhiteList")
  ignoreWhiteList: string[];

  /**
   * 公共的passport策略选项，比如多个策略，[本地策略，JWT策略, ...]
   * 可能有些公共配置对部分策略无效
   */
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {
      // failureRedirect: "/login", // 认证失败
      // successRedirect: "/", // 认证成功
      // userProperty: "", // 设置到 ctx.state 或者 req 上的 key，默认 "user", this.ctx.state.user
    };
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
