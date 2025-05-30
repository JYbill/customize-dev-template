import undici from "undici";

import { HttpError } from "#error/http-error.js";
import { globalLogger } from "#logger";

const logger = globalLogger.child({ fileFlag: "undici/util.js" });

export default class UndiciUtil {
  /**
   * 请求重试
   * @param params
   * @return {Promise<Dispatcher.ResponseData<null>>}
   */
  static async retry(params) {
    const { url, method = "POST", body, headers = {}, options } = params;
    const { maxRetries = 3, delayMs = 1500 } = options;

    // 创建一个包含重试拦截器的 dispatcher
    const dispatcher = undici.getGlobalDispatcher().compose(
      undici.interceptors.retry({
        maxRetries: maxRetries,
        minTimeout: delayMs,
        maxTimeout: 5000,
        timeoutFactor: 2,
        retryAfter: true,
        statusCodes: [400, 500], // 针对这些状态码重试
        methods: ["GET", "POST", "PUT", "DELETE"],
      }),
    );

    try {
      logger.log(`undici request: ${url}`);
      const response = await undici.request(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers, // 合并传入的 headers
        },
        body: JSON.stringify(body),
        dispatcher,
      });

      if (response.statusCode !== 200) {
        logger.log(
          `undici failed, statusCode=%s, responseData=%s, responseInstance=%s`,
          response.statusCode,
          response.body,
          response,
        );
        throw HttpError.throwRequestError("request params error");
      }

      // 成功
      logger.log(`undici success`);
      return response;
    } catch (error) {
      logger.log(`undici error: %s`, error);
      throw HttpError.throwServerError("undici error");
    }
  }
}
