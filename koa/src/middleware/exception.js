/**
 * @Description: 全局异常中间件
 * @Date: 2024/6/25 17:41
 */
import ResponseUtil from "#app/utils/response.util.js";
import { globalLogger } from "#logger";
import HttpError from "#utils/exception.util.js";

const logger = globalLogger.child({ fileFlag: "middleware/exception.js" });

export default async function (ctx, next) {
  try {
    await next();
    // console.log(ctx.status, ctx.body, ctx.message); // debug
    switch (ctx.status) {
      case 404:
      case 405: {
        ctx.body = ResponseUtil.error(ctx.message || "not found", ctx.status);
      }
    }
  } catch (err) {
    const bodyParams = ctx.req.body || ctx.request.body;
    const url = "url:" + ctx.originalUrl;
    const weixinXml = ctx.weixin_xml;
    const postBody = "post_body:" + weixinXml ? weixinXml : bodyParams;

    logger.error(
      "global exception url: %s, body: %s, reason: %s",
      url,
      postBody,
      err.message,
    );
    ctx.status = err.status || 500;
    ctx.body = ResponseUtil.error(err.message, err.code);
  }
}
