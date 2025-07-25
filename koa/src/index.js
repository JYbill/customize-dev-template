/**
 * @Description: 入口文件
 * @Date: 2024/6/25 14:53
 */
import "./config/env-loader.js"; // 用于加载dotenv环境变量
import fs from "node:fs";
import path from "node:path";
import koa from "koa";
import conditionalGet from "koa-conditional-get";
import bodyParser from "koa-bodyparser";
import etag from "koa-etag";
import helmet from "koa-helmet";
import KoaResponseTime from "koa-response-time";
import morganLogger from "./middleware/morgan.js";
import exceptionMiddleware from "./middleware/exception.js";
import compress from "koa-compress";
import cors from "@koa/cors";
import zlib from "node:zlib";
import { config } from "#config";
import { passport } from "#lib/passport/index.js";
import { fileURLToPath } from "node:url";
import session from "koa-session";
import { UrlAlphabetNanoid } from "#lib/nanoid/index.js";
import { RedisStore } from "#lib/session/store.js";

process.on("uncaughtException", (err) => {
  logger.error("uncaughtException: %s", err.stack || err);
});
process.on("unhandledRejection", (err) => {
  logger.error("unhandledRejection: %s", err.stack || err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new koa();
app.on("error", (koaErr, ctx) => {
  logger.error("koa error: %s", koaErr.stack || koaErr);
});

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
      flush: zlib.constants.Z_SYNC_FLUSH,
    },
  }),
);
app.use(
  session(
    {
      key: "oauth.sid",
      maxAge: ms("1d"),
      genid: (ctx) => {
        const nanoid = UrlAlphabetNanoid();
        const prefix = config.redis.prefix;
        return `${prefix}sid:${nanoid}`;
      },
      store: RedisStore,
    },
    app,
  ),
);
// CORS 跨域
app.use(
  cors({
    origin: "*", // Access-Control-Allow-Origin
    allowHeaders: ["Content-Type"], // Access-Control-Allow-Headers
    allowMethods: ["OPTIONS", "GET", "POST"], // Access-Control-Allow-Methods
  }),
);
// 二级域名设置, 如：app.test.com -> test.com
app.use(async (ctx, next) => {
  ctx.jkfDomain = ctx.subdomains.reverse().join(".");
  await next();
});
// SSR模板引擎
app.use(
  views(__dirname + "/views", {
    autoRender: false,
    extension: "ejs",
  }),
);

// 认证 与 授权

// 路由
const { rootRouter } = await import("./controller/index.js");
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());

// HTTP服务
const httpServer = http.createServer(app.callback());

// WS服务
SocketIOContainer.init(httpServer);

httpServer.listen(config.application.port, () => {
  logger.info(`wzj-nodejs-v2 is running on http://localhost:${config.application.port || 3000}`);
  logger.info(`wzj-nodejs-v2 is running on ws://localhost:${config.application.port || 3000}`);
});

