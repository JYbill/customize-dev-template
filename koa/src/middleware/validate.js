import joi from "joi";

import HttpError from "#utils/exception.util.js";

class ValidateError extends Error {
  constructor(msg, code = 400) {
    super();
    this.code = code;
    this.message = msg;
  }
}

const validator = (o, schema) => {
  if (schema) {
    const JoiSchema = joi.object(schema);
    const { error, value } = JoiSchema.validate(o, { allowUnknown: true });
    Object.assign(o, value);
    if (error) {
      console.error("invalid params", error.message, o, value);
      throw new ValidateError(error.message);
    }
  }
};

const validate =
  ({ headers, query, params, body }) =>
  async (ctx, next) => {
    try {
      validator(ctx.headers, headers);
      validator(ctx.query, query);
      validator(ctx.params, params);
      validator(ctx.request.body, body);
      await next();
    } catch (e) {
      if (e instanceof ValidateError) {
        throw new HttpError(400, `error params: ${e.message}`);
      } else {
        throw e;
      }
    }
  };

export { validate, joi };
