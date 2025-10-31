/**
 * @Description: 全局异常中间件
 * @Date: 2024/6/25 17:41
 */
import { ExecutionError } from "@sesamecare-oss/redlock";

import { type Context, type Next } from "koa";

import ResponseUtil from "#app/utils/response.util.ts";
import { ErrorCode, HttpError } from "#error/index.ts";
import { globalLogger } from "#logger";
import type { GlobalError } from "#types/library.d.ts";
import { isTrusty } from "#utils/lodash.util.ts";

const logger = globalLogger.child({ fileFlag: "middleware/exception.ts" });
export default async function (ctx: Context, next: Next) {
  try {
    await next();
    // console.log("exception.js", ctx.status, ctx.body, ctx.message); // debug
    switch (ctx.status) {
      case 404:
      case 405: {
        const statusCode = ctx.status;
        ctx.status = statusCode;
        ctx.body = ResponseUtil.error(ctx.message || "not found", ctx.status);
      }
    }
  } catch (err: unknown) {
    let error = err as GlobalError;
    ctx.status = error.status || 500;
    const data = error.data;

    // 打印错误逻辑
    // 打印500错误
    if (error.name === "InternalServerError" && error.message === "stream is not readable") {
      logger.error("user disconnect to sever");
    } else if (ctx.status === 500 || isTrusty(error.code)) {
      const { stack, name, message, ...errorMetaData } = error;
      logger.error("%o\n%o", error, errorMetaData);
    }

    // 抛出错误逻辑
    if (error instanceof ExecutionError) {
      // 抢占分布式锁失败
      ctx.status = 200;
      error = HttpError.throwRequestError(
        "get redlock failed, pls try again",
        ErrorCode.PREEMPT_LOCK_FAILED,
      );
    } else if (
      // DB错误保障，可能不全，后续遇到再添加
      ctx.status === 500 &&
      [
        "ER_BAD_FIELD_ERROR",
        "ER_PARSE_ERROR",
        "ER_WRONG_VALUE_COUNT_ON_ROW",
        "ER_NON_UNIQ_ERROR",
        "ER_LOCK_WAIT_TIMEOUT",
        "ER_NO_DEFAULT_FOR_FIELD",
        "ER_TRUNCATED_WRONG_VALUE",
        "ER_BAD_NULL_ERROR",
        "ER_NO_SUCH_TABLE",
        "ER_DIVISION_BY_ZERO",
        "ER_DUP_ENTRY",
        "ER_WRONG_FIELD_WITH_GROUP",
        "ER_MIX_OF_GROUP_FUNC_AND_FIELDS",
        "ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT",
      ].includes(String(error.code))
    ) {
      error = HttpError.throwServerError("DB Exception");
    } else if (ctx.status === 500 && !error.code) {
      error = HttpError.throwServerError("server error");
    }

    logger.error(
      `global exception | url=%s | reason=%s | status=%s | errorCode=%s`,
      ctx.originalUrl,
      error.message,
      ctx.status,
      error.code,
    );
    ctx.body = ResponseUtil.error(error.message, error.code, data);
  }
}
