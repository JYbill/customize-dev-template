import type { Worker } from "bullmq";
import fs from "fs";
import http from "http";

import "./config/env-loader.ts";

import { config } from "#config";

import cors from "@koa/cors";

import type { Context, Next } from "koa";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import conditionalGet from "koa-conditional-get";
import etag from "koa-etag";
import helmet from "koa-helmet";
import KoaResponseTime from "koa-response-time";
import session from "koa-session";

import path from "node:path";
import zlib from "node:zlib";

import { RootRouterLoader } from "#app/controller/index.ts";
import { db } from "#db";
import { db as logDb } from "#db/log.ts";
import { asyncLocalStorage } from "#lib/async-local-storage/index.ts";
import { app } from "#lib/koa/index.ts";
import { GlobalRedis } from "#lib/redis/index.ts";
import { BullMQQueueInstance } from "#lib/redis/queue.ts";
import { redlockRedis } from "#lib/redis/redlock.ts";
import { BullMQWorkerInstance } from "#lib/redis/worker.ts";
import { RedisStore } from "#lib/session/index.ts";
import { globalLogger as logger } from "#logger";
import apiSign from "#middleware/api-sign.ts";
import AuthoRoleMiddleware from "#middleware/autho-role.ts";
import { LogReportMiddleware } from "#middleware/log-report.ts";
import ResponseWrapper from "#middleware/response-wrapper.ts";
import { Initialization } from "#service/init/index.ts";
import type { AsyncContext } from "#types/library.d.ts";
import { isFalsy } from "#utils/lodash.util.ts";
import { SocketIOContainer } from "#ws/index.ts";

import AuthMiddleware from "./middleware/auth.ts";
import ExceptionMiddleware from "./middleware/exception.ts";
import morganLogger from "./middleware/morgan.ts";

process.on("uncaughtException", (err: Error) => {
  logger.error("uncaughtException: %s", err.stack || err);
});
process.on("unhandledRejection", (err: Error) => {
  logger.error("unhandledRejection: %s", err.stack || err);
});

// 优雅关闭进程
let isShutDowning = false;
async function genderShutDown() {
  if (isShutDowning) return; // 正在优雅关闭后台服务
  isShutDowning = true;
  logger.info(`process[${process.pid}] is closing!`);

  // 并行关闭bullmq
  const bullmqShutdownTasks: Promise<void>[] = [];
  const bullmqDirPath = path.join(config.application.projectPath, "src/service/job");
  for (const filename of fs.readdirSync(bullmqDirPath)) {
    if (!filename.endsWith(".ts")) continue; // 目录，直接跳过

    // 所有模块文件
    const filepath = path.resolve(bullmqDirPath, filename);
    const module = (await import(filepath)) as { worker?: Worker; default?: { worker: Worker } };
    const worker = module.worker || module.default!.worker;

    // 模块文件没有抛出"worker"实例
    if (isFalsy(worker)) continue;

    // worker存在，开始异步任务
    bullmqShutdownTasks.push(worker.close());
  }
  await Promise.all(bullmqShutdownTasks);

  // 并行关闭db、redis
  await Promise.all([
    db.destroy().catch((err) => {
      logger.error("wzj mysql shut down error: %s", err);
    }),
    logDb.destroy().catch((err) => {
      logger.error("wzj mysql shut down error: %s", err);
    }),
    GlobalRedis.quit().catch((error) => {
      logger.error("global redis shut down error: %s", error);
    }),
    BullMQQueueInstance.quit().catch((error) => {
      logger.error("bullmq-queue redis shut down error: %s", error);
    }),
    BullMQWorkerInstance.quit().catch((error) => {
      logger.error("bullmq-worker redis shut down error: %s", error);
    }),
    redlockRedis.quit().catch((error) => {
      logger.error("redlock redis shut down error: %s", error);
    }),
  ]);
  logger.info(`process[${process.pid}] is close.`);
  process.exit(0);
}
process.on("SIGTERM", genderShutDown);
process.on("SIGINT", genderShutDown);

// 响应内容压缩
// ⚠️ 一定要位于响应的最后一个中间件，保证输出内容必定经过压缩，且压缩相关响应头正确设置
app.use(
  compress({
    gzip: {
      flush: zlib.constants.Z_SYNC_FLUSH,
    },
    deflate: false,
  }),
);
app.use(
  // @ts-ignore
  session(
    {
      key: "wzj2.sid",
      maxAge: "session",
      autoCommit: true,
      httpOnly: true,
      signed: true,
      overwrite: true,
      secure: false,
      store: RedisStore,
    },
    app,
  ),
);
// CORS 跨域
app.use(
  cors({
    origin: "*", // Access-Control-Allow-Origin
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Access-Control-Allow-Headers
    allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"], // Access-Control-Allow-Methods
  }),
);
app.use(ExceptionMiddleware); // 全局异常拦截器
app.use(KoaResponseTime());
app.use(helmet());
app.use(bodyParser());
app.use(conditionalGet());
app.use(etag());
app.use(ResponseWrapper); // 全局响应结果处理器
app.use(morganLogger); // 默认http响应结束时打印日志
// 二级域名设置, 如：app.test.com -> test.com
app.use(async (ctx: Context, next: Next) => {
  ctx.jkfDomain = ctx.subdomains.reverse().join(".");
  await next();
});
// async-local-storage
app.use(async (ctx: Context, next: Next) => {
  const store = Object.create(null) as AsyncContext;
  store.ctx = ctx;
  await asyncLocalStorage.run(store, () => next());
});
app.use(LogReportMiddleware());

// 具有拦截功能的中间件
// 全局认证、鉴权中间件
app.use(AuthMiddleware());
app.use(AuthoRoleMiddleware());
// api签名
app.use(apiSign());

// 路由
const loader = new RootRouterLoader();
const rootRouter = loader.router;
// 之前可以加载路由中间件
await loader.load();
// 之后加载的"路由中间件"（不是路由）全部在最后才会执行，如果没有掉next()，则不会执行后续路由中间件（注意这里仅限路由中间件）
// 处理favicon.ico的路由
rootRouter.get("/favicon.ico", (ctx: Context) => {
  ctx.status = 200;
  ctx.res.end();
});
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());

// 初始化操作
void Initialization.execute();

// HTTP服务
const httpServer = http.createServer(app.callback());

// WS服务
SocketIOContainer.init(httpServer);

httpServer.listen(config.application.port || 3000, () => {
  logger.info(`wzj-nodejs-v2 is running on http://localhost:${config.application.port || 3000}`);
  logger.info(`wzj-nodejs-v2 is running on ws://localhost:${config.application.port || 3000}`);
});
