import cors from "@koa/cors";

import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import conditionalGet from "koa-conditional-get";
import etag from "koa-etag";
import helmet from "koa-helmet";
import responseTime from "koa-response-time";

import { createServer, type Server } from "node:http";

import { registerShutdownListeners } from "#app/bootstrap/shutdown.ts";
import { loadRoutes } from "#app/controller/index.ts";
import { config } from "#config";
import { app } from "#lib/koa/index.ts";
import exceptionMiddleware from "#middleware/exception.ts";
import requestLogger from "#middleware/morgan.ts";

/** 装配通用 HTTP 中间件与路由，并在端口监听成功后接管退出信号。 */
export async function startHttp(): Promise<Server> {
  app.use(requestLogger);
  app.use(cors());
  app.use(exceptionMiddleware);
  app.use(compress());
  app.use(responseTime());
  app.use(helmet());
  app.use(bodyParser());
  app.use(conditionalGet());
  app.use(etag());
  const router = await loadRoutes();
  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = createServer(app.callback());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen({ port: config.port, host: config.host }, () => {
      server.off("error", reject);
      resolve();
    });
  });

  registerShutdownListeners(server);
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : config.port;
  console.info("Koa HTTP listening on http://" + config.host + ":" + port);
  return server;
}
