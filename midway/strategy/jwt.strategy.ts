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

  async validate(payload) {
    return payload;
  }

  /**
   * option 参考：passport-jwt
   * @returns
   */
  getStrategyOptions(): any {
    return {
      secretOrKey: this.jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
  }
}
