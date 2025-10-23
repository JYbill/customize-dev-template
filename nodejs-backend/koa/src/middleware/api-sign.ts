import moment from "moment";

import { config } from "#config";

import type { Context, Next } from "koa";

import { allowRPCApis, authIgnoreApis } from "#enum/api.enum.ts";
import { HttpError } from "#error/index.ts";
import { CryptoUtil } from "#utils/crypto.util.ts";
import { isFalsy } from "#utils/lodash.util.ts";

const { WZJ_API_KEYS, WZJ_API_SECRETS } = config.apiSign;

export default () => {
  return async function (ctx: Context, next: Next): Promise<any> {
    // 认证忽略的接口
    const urlPath = ctx.path;
    for (const api of authIgnoreApis) {
      if (api.test(urlPath)) return await next();
    }

    // 能走到这里一定是通过了用户认证授权，这里就不必进行api签名授权了
    if (isFalsy(ctx.header["client-id"])) return await next();

    // 检测未允许访问的rpc接口列表
    const exist = allowRPCApis.some((api) => api.test(urlPath));
    if (isFalsy(exist)) throw HttpError.throwForbiddenError("rpc api forbidden");

    // 开始api签名授权的校验
    const headers = ctx.header;
    const clientId = headers["client-id"] as string;
    const clientSign = headers["client-sign"] as string;
    const timestamp = Number(headers.timestamp);

    if (isFalsy(clientId) || isFalsy(clientSign) || isFalsy(timestamp)) {
      throw HttpError.throwRequestError("invalid api sign params");
    }

    // 检测是否超时(5m)
    const before5timestamp = moment(new Date(timestamp)).add(5, "minutes");
    if (Date.now() >= before5timestamp.valueOf()) {
      throw HttpError.throwForbiddenError("api sign timeout, pls retry");
    }

    // 获取api密钥
    if (!WZJ_API_KEYS.includes(clientId)) {
      throw HttpError.throwForbiddenError("invalid client id");
    }
    const apiIdx = WZJ_API_KEYS.findIndex((key) => key === clientId);
    const apiSecret = WZJ_API_SECRETS[apiIdx];

    // 检测加密签名是否合法
    const hmac256 = await CryptoUtil.cryptoSignHMAC(apiSecret, timestamp);
    if (hmac256 !== clientSign) {
      throw HttpError.throwForbiddenError("invalid client sign");
    }

    await next();
  };
};
