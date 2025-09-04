import type { NextFunction, Request, Response } from "express";
import { ApiSignException, ParamsMissedException } from "@/common/exception/global.expectation";
import { DatetimeUtil } from "@/common/util/datetime.util";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CryptoUtil } from "@/common/util/crypto.util";

@Injectable()
export default class ApiSignMiddleware {
  constructor(private readonly configService: ConfigService<IEnv>) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const headers = req.headers;
    const clientId = headers["client-id"];
    const clientSign = headers["client-sign"];
    const timestamp = headers.timestamp as string;
    const accessKeys = this.configService.getOrThrow<string[]>("API_ACCESS_KEYS");
    const accessSecrets = this.configService.getOrThrow<string[]>("API_ACCESS_SECRETS");

    if (!timestamp) {
      throw new ParamsMissedException("miss timeout field");
    }

    // 检测是否超时(5m)
    const before5timestamp = DatetimeUtil.beforeNMinute(timestamp);
    if (Date.now() >= before5timestamp.valueOf()) {
      throw new ApiSignException("api sign timeout, pls retry");
    }

    const accessKeyIdx = accessKeys.findIndex((key) => key === clientId);
    if (accessKeyIdx < 0) {
      throw new ApiSignException("invalid client id");
    }

    // 检测加密签名是否合法
    const accessSecret = accessSecrets[accessKeyIdx];
    const signBuffer = await CryptoUtil.hmac256(accessSecret, timestamp);
    const hmac256 = Buffer.from(signBuffer).toString("hex");
    if (hmac256 !== clientSign) {
      throw new ApiSignException("invalid client sign");
    }

    next();
  }
}
