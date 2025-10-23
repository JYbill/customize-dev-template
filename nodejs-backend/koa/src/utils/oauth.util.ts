import { config } from "#config";

import type { Context } from "koa";

import { ClientType } from "#enum/oauth.enum.ts";
import { globalLogger } from "#logger";

const logger = globalLogger.child({ fileFlag: "utils/oauth.util.ts" });
const frontConfig = config.front;
const corpWechatFrontConfig = config.corpWechatFront;
export class OauthUtil {
  /**
   * 重定向到前端错误页面
   * @param ctx
   * @param errorReason
   */
  static redirectErrorPage(ctx: Context, errorReason: string) {
    if (errorReason) {
      errorReason = errorReason.toLowerCase();
    }
    const userAgent = ctx.headers["user-agent"] || "";
    logger.info(
      "Redirecting to error page, user-agent: %s, errorReason: %s",
      userAgent,
      errorReason,
    );

    if (/wxwork/i.test(userAgent)) {
      const url = new URL(corpWechatFrontConfig.errorUrl);
      url.searchParams.set("error", errorReason);
      ctx.redirect(url.href);
    } else {
      const url = new URL(frontConfig.errorUrl);
      url.searchParams.set("error", errorReason);
      ctx.redirect(url.href);
    }
    return;
  }

  static redirectOauthPage(ctx: Context) {
    const userAgent = ctx.headers["user-agent"] || "";
    logger.info("Redirecting to OAuth page, user-agent: %s", userAgent);
    const clientType = this.detectClient(userAgent);
    let url: URL;
    switch (clientType) {
      case ClientType.WXWORK:
        url = new URL(corpWechatFrontConfig.oauthTokenUrl);
        logger.info("Redirecting to corporate WeChat OAuth page: %s", url.href);
        ctx.redirect(url.href);
        break;
      case ClientType.WECHAT:
        url = new URL(frontConfig.oauthTokenUrl);
        logger.info("Redirecting to WeChat OAuth page: %s", url.href);
        ctx.redirect(url.href);
        break;
      default:
        url = new URL(frontConfig.oauthTokenUrl);
        logger.info("Redirecting to front OAuth page: %s", url.href);
        ctx.redirect(url.href);
    }
    return;
  }

  static detectClient(userAgent: string) {
    userAgent = userAgent.toLowerCase();
    if (userAgent.includes("wxwork")) {
      return "corp-weixin"; // 企业微信
    }
    if (userAgent.includes("micromessenger")) {
      return "weixin"; // 微信
    }
    return "browser"; // 普通浏览器
  }
}
