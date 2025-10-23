import type { Context, Next } from "koa";

import { ApiLogQueue } from "#enum/bullmq.enum.ts";
import { queue } from "#service/job/api-log.job.ts";

/**
 * @Description: 日志上报中间件
 * @Date: 2025/9/4 11:16
 */
export function LogReportMiddleware() {
  return async function (ctx: Context, next: Next) {
    await next();
    const request = ctx.request;
    const query = request.query as Record<string, any>;
    const body = ctx.request.body as Record<string, any>;
    const params = ctx.params as Record<string, any>;
    const user = ctx.state.user;
    await queue.add(ApiLogQueue.API, {
      accountId: user?.accountId ?? null,
      teacherId: user?.teacherId ?? null,
      studentId: user?.teacherId ?? null,
      ip: ctx.ip,
      url: request.url,
      method: request.method,
      agent: request.headers.age ?? "",
      userPayload: JSON.stringify(user) || "{}",
      requestBody: JSON.stringify({
        query,
        params,
        body,
      }),
    });
  };
}
