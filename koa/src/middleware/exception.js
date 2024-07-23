/**
 * @Description: 全局异常中间件
 * @Date: 2024/6/25 17:41
 */
import ResponseUtil from "#app/utils/response.util.js";
import { globalLogger } from "#logger";

const logger = globalLogger.child({ fileFlag: "middleware/exception.js" });

export default async function (ctx, next) {
  try {
    await next();
    // console.log("exception.js", ctx.status, ctx.body, ctx.message); // debug
    switch (ctx.status) {
      case 404:
      case 405: {
        ctx.body = ResponseUtil.error(ctx.message || "not found", ctx.status);
      }
    }
  } catch (err) {
    logger.error(err);
    const url = ctx.originalUrl;
    const weixinXml = ctx.weixin_xml;
    const bodyParams = ctx.body;
    const postBody = weixinXml ? weixinXml : bodyParams;

    logger.error(
      "global exception url: %s, body: %s, reason: %s",
      url,
      postBody,
      err.message,
    );
    ctx.status = err.status || 500;
    ctx.body = ResponseUtil.error(err.message, ctx.status);
  }
}
