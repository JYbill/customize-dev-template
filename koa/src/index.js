/**
 * @Description: 入口文件
 * @Author: 小钦var
 * @Date: 2024/6/25 14:53
 */
const fs = require("node:fs");
const path = require("node:path");
const router = require("./router/index.js");
const koa = require("koa");
const dotenv = require("dotenv");
const conditionalGet = require("koa-conditional-get");
const bodyParser = require("koa-bodyparser");
const etag = require("koa-etag");
const helmet = require("koa-helmet");
const KoaResponseTime = require("koa-response-time");
const morganLogger = require("./middleware/morgan.js");
const exceptionMiddleware = require("./middleware/exception.js");
const compress = require("koa-compress");
const cors = require("@koa/cors");

async function main() {
  // 读取环境变量
  const configPath = path.resolve(__dirname, "../config");
  dotenv.config({
    path: [
      path.resolve(configPath, ".env"), // 优先级最高
      process.env.NODE_ENV === "production"
        ? path.resolve(configPath, ".production.env")
        : path.resolve(configPath, ".development.env"),
    ],
  });
  // 附加环境变量
  process.env.PROJECT_DIR = path.resolve(__dirname, "..");

  const app = new koa();

  // koa配置
  app.subdomainOffset = 0;

  app.use(KoaResponseTime());
  app.use(exceptionMiddleware); // 全局异常拦截器
  app.use(bodyParser());
  app.use(conditionalGet());
  app.use(etag());
  app.use(helmet());
  app.use(morganLogger); // 默认http响应结束时打印日志
  // 响应内容压缩
  app.use(
    compress({
      gzip: {
        flush: require("zlib").constants.Z_SYNC_FLUSH,
      },
    }),
  );
  // CORS 跨域
  app.use(
    cors({
      origin: "http://localhost:1213", // Access-Control-Allow-Origin
      allowHeaders: ["Content-Type"], // Access-Control-Allow-Headers
      allowMethods: ["OPTIONS", "GET", "POST"], // Access-Control-Allow-Methods
    }),
  );
  // 二级域名设置, 如：app.test.com -> test.com
  app.use(async (ctx, next) => {
    ctx.jkfDomain = ctx.subdomains.reverse().join(".");
    await next();
  });

  // 路由
  app.use(router.routes());
  app.use(
    router.allowedMethods({
      throw: true,
    }),
  );

  app.listen(process.env.PORT || 3000);
  console.log(`wzj-nodejs-v2 is running on http://localhost:${process.env.PORT}`);
}
main();
