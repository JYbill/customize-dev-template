import { Injectable, Logger } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { OAuthClientCredentialException } from "@/common/exception/global.expectation";
import { differenceInMinutes, subMinutes } from "date-fns";
import { CryptoUtil } from "@/common/util/crypto.util";
import { ClientService } from "@/client/client.service";
import { LodashUtils } from "@/common/util/loadsh.util";

/**
 * @Description: 客户端凭证中间件
 * @Date: 2025/1/14 13:49
 */
@Injectable()
export default class OAuthClientCredentialMiddleware {
  private readonly logger: Logger = new Logger(OAuthClientCredentialMiddleware.name);

  constructor(private readonly clientService: ClientService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const headers = req.headers;
    const clientId = headers["client-id"] as string;
    const clientSign = headers["client-sign"] as string;
    const timestamp = headers["timestamp"] as string;

    // 检测是否超时(5m)
    let diffMin = differenceInMinutes(Number(timestamp), Date.now());
    diffMin = Math.abs(diffMin);
    if (diffMin >= 5) {
      this.logger.error(`now=${Date.now()}, timestamp=${timestamp}`);
      throw new OAuthClientCredentialException("api sign timeout, pls retry");
    }

    // 校验client_id是否合法
    const clientInfo = await this.clientService.getClientByCid(clientId);
    if (LodashUtils.isFalsy(clientInfo)) {
      this.logger.error(`clientId=${clientId} 不合法，请检查DB是否有记录`);
      throw new OAuthClientCredentialException("invalid client id");
    }

    // 检测加密签名是否合法
    const signBuffer = await CryptoUtil.hmac256(clientInfo.clientSecret, timestamp);
    const hmac256 = Buffer.from(signBuffer).toString("hex");
    if (hmac256 !== clientSign) {
      this.logger.error(`client-sign=${clientSign} | timestamp=${timestamp}`);
      throw new OAuthClientCredentialException("client-sign is invalid");
    }
    next();
  }
}
