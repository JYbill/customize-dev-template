/**
 * @Description: Morgan日志库
 * @Author: 小钦var
 * @Date: 2024/6/25 16:45
 */
const Morgan = require("koa-morgan");
Morgan.token("realIP", (req, res) => {
  const clientIP = req.connection.remoteAddress;
  return req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || clientIP;
});
const log = [];
log.push(":realIP");
log.push(":date[clf]");
log.push("HTTP/:http-version [:method] :status :url :response-time ms");
log.push(":res[content-length]");
log.push(":referrer");
log.push(":user-agent");
const logger = Morgan(log.join(" | "));
module.exports = logger;
