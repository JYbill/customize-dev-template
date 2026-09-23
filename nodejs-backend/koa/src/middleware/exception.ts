import type { Context, Next } from "koa";

/** 将 HTTP 异常转换为不包含内部错误细节的 JSON 响应。 */
export default async function exceptionMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    const status =
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status <= 599
        ? error.status
        : 500;

    ctx.status = status;
    ctx.body = { error: status >= 500 ? "Internal Server Error" : error.message };

    if (status >= 500) {
      ctx.app.emit("error", error, ctx);
    }
  }
}
