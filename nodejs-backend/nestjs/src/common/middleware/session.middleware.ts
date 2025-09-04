import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { LodashUtils } from "@/common/util/loadsh.util";
import { ResponseUtil } from "@/common/util/response.util";
import { AuthService } from "@/auth/auth.service";

/**
 * @Description: session校验中间件
 * @Date: 2024/4/16 9:06
 */
@Injectable()
export default class SessionAuthMiddleware {
  private readonly logger: Logger = new Logger(SessionAuthMiddleware.name);

  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const session = req.session;
    const user = session.user;
    if (LodashUtils.isFalsy(user)) {
      this.logger.error("session中不存在user");
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseUtil.error("登录已超时，请重新登录"));
    }

    // session存在但过期，场景：用户恶意使用过期cookie
    if (Date.now() >= user.expireTime) {
      this.logger.error("session已过期");
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseUtil.error("登录已超时，请重新登录"));
    }

    const userId = user.id;
    const sessionId = session.id;
    const loginState = await this.authService.getLoginStateBySid(userId, sessionId);
    if (!loginState || Date.now() > loginState.expireIn) {
      this.logger.error("用户态已过期");
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseUtil.error("登录已超时，请重新登录"));
    }
    next();
  }
}
