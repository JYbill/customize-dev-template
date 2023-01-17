import { ExtractJwt, Strategy } from "passport-jwt";

import { ILogger } from "@midwayjs/core";
import { Config, Logger } from "@midwayjs/decorator";
import { CustomStrategy, PassportStrategy } from "@midwayjs/passport";

@CustomStrategy()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  @Config("jwt")
  jwtConfig;

  @Logger()
  logger: ILogger;

  /**
   * 策略的验证
   * @param payload token = `${sign}.${payload = 信息}.${加密(sign + payload + 密钥)}`，
   *    这里是base解码payload信息，转的json对象
   */
  async validate(payload) {
    return payload;
  }

  /**
   * passport-jwt的option
   * doc https://github.com/mikenicholson/passport-jwt#configure-strategy
   * @returns
   */
  getStrategyOptions() {
    return {
      secretOrKey: this.jwtConfig.secret,
      // 1. passport-jwt解析token
      // 在request请求头中查找`bearer ${token}` => 解析token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
  }
}
