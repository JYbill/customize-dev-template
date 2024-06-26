/**
 * @Description: 全局异常中间件
 * @Author: 小钦var
 * @Date: 2024/6/25 17:41
 */
const ResponseUtil = require("#app/utils/response.util.js");

module.exports = async function (ctx, next) {
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
};
