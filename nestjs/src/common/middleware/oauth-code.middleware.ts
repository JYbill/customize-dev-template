import { Injectable, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { OauthService } from "@/oauth/oauth.service";
import { ResponseUtil } from "@/common/util/response.util";

/**
 * @Description: OAuth access-token校验中间件
 * @Date: 2024/4/16 9:06
 */
@Injectable()
export default class OAuthCodeCredentialMiddleware {
  private readonly logger: Logger = new Logger(OAuthCodeCredentialMiddleware.name);

  constructor(private readonly oauthService: OauthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const header = req.headers;
    const verifyResult = await this.oauthService.verifyAccessToken(req, {
      clientId: header["client-id"] as string,
      accountId: header["account-id"] as string,
      clientSecretHex: header["client-secret-hex"] as string,
      nonce: header.nonce as string,
      authorization: header.authorization as string,
    });
    if (!verifyResult.verify) {
      this.logger.error("verify:", verifyResult);
      return res.status(400).json(ResponseUtil.error(verifyResult.message));
    }
    next();
  }
}
