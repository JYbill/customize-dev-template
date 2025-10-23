import type { Context, Next } from "koa";

import { validate } from "#middleware/validate.ts";
import type { ValidateMiddlewareParams } from "#types/middleware.d.ts";
import { FsUtil } from "#utils/fs.util.ts";
import { isTrusty } from "#utils/lodash.util.ts";

/**
 * @Description: validate()中间件的包装
 * 功能：参数校验报错后，将同时删除上传的文件
 * @Date: 2025/9/10 10:36
 * @example
 * ```ts
 *   uploader.single("file"),
 *   validateWithFs({
 *     body: {
 *       curriculumId: Joi.number().required(),
 *     },
 *   }),
 * ```
 */

export function validateWithFs(params: ValidateMiddlewareParams) {
  return async (ctx: Context, next: Next) => {
    const file = ctx.file;
    const middleware = validate(params);

    try {
      await middleware(ctx, next);
    } finally {
      if (isTrusty(file)) await FsUtil.remove(file.path);
    }
  };
}
