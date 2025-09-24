import { config } from "#config";

import koa, { type Context } from "koa";

import { globalLogger as logger } from "#logger";

const app = new koa();

// koa配置
app.proxy = true;
app.subdomainOffset = 0;
app.keys = config.auth.SESSION_SECRETS;

app.on("error", (koaErr: Error, _ctx: Context) => {
  logger.error("koa error: %s", koaErr.stack || koaErr);
});

export { app };
