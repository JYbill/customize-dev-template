/**
 * @Description: 全局异常中间件
 * @Date: 2024/6/25 17:41
 */
import ResponseUtil from "#app/utils/response.util.js";

export default async function (ctx, next) {
  try {
    await next();
  } catch (err) {
    const bodyParams = ctx.req.body || ctx.request.body;
    const url = "url:" + ctx.originalUrl;
    const weixinXml = ctx.weixin_xml;
    const postBody = "post_body:" + weixinXml ? weixinXml : bodyParams;

    console.error("global exception:", url, postBody, err.message);
    ctx.status = err.status || 500;
    ctx.body = ResponseUtil.error(err.message, err.code);
  }
}
