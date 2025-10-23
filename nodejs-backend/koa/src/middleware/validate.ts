import joi, { type Schema } from "joi";

import type { Context, Next } from "koa";

import { HttpError } from "#error/index.ts";
import { globalLogger } from "#logger";
import type { ValidateMiddlewareParams } from "#types/middleware.d.ts";
import { isFalsy } from "#utils/lodash.util.ts";

const logger = globalLogger.child({ fileFlag: "middleware/validate.ts" });

class ValidateError extends Error {
  code: number;
  message: string;
  constructor(msg: string, code: number = 400) {
    super();
    this.code = code;
    this.message = msg;
  }
}

const validator = (o: any, schema?: Schema) => {
  if (isFalsy(schema)) return;
  let JoiSchema: Schema;
  if (schema.type === "array") {
    JoiSchema = schema;
  } else {
    JoiSchema = joi.object(schema);
  }
  const result = JoiSchema.validate(o, { allowUnknown: true, convert: true });
  Object.assign(o, result.value);
  if (result.error) {
    logger.error("invalid params", result.error.message, o, result.value);
    throw HttpError.throwRequestError(result.error.message);
  }
};

const validate =
  ({ headers, query, params, body }: ValidateMiddlewareParams) =>
  async (ctx: Context, next: Next) => {
    try {
      validator(ctx.headers, headers as Schema);
      validator(ctx.query, query as Schema);
      validator(ctx.params, params as Schema);
      validator(ctx.request.body, body as Schema);
      await next();
    } catch (e) {
      if (e instanceof ValidateError) {
        throw HttpError.throwRequestError(`error params: ${e.message}`);
      } else {
        throw e;
      }
    }
  };

export { validate, joi };
