import { pipeline } from "stream";
import undici from "undici";

import { config } from "#config";

import fs from "node:fs";
import path from "node:path";

import { HttpError } from "#error/http-error.ts";
import { Nanoid } from "#lib/nanoid/index.ts";
import { globalLogger } from "#logger";
import type { UndiciDownloadFileParams } from "#types/util.d.ts";
import { isFalsy, isTrusty } from "#utils/lodash.util.ts";

const appConfig = config.application;
const logger = globalLogger.child({ fileFlag: "utils/request.util.ts" });

export default class UndiciUtil {
  /**
   * 请求重试
   * @param params
   */
  static async retry(params: {
    url: string;
    method?: string;
    body?: Record<string, any> | any[];
    headers?: Record<string, string>;
    options?: {
      maxRetries?: number;
      delayMs?: number;
    };
  }) {
    const { url, method = "POST", body, headers = {}, options = {} } = params;
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
      logger.info("undici request: %s", url);
      const response = await undici.request(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers, // 合并传入的 headers
        },
        body: isTrusty(body) ? JSON.stringify(body) : null,
        dispatcher,
      });

      // 状态码不正确
      if (response.statusCode !== 200) {
        logger.error(
          `undici failed, statusCode=%s, responseData=%s, responseInstance=%s`,
          response.statusCode,
          await response.body.text(),
        );
        throw HttpError.throwServerError("request params error");
      }

      // 成功
      logger.info("undici success");
      return response;
    } catch (error) {
      logger.error("undici error: %s", error);
      throw HttpError.throwServerError("undici error");
    }
  }

  /**
   * 下载文件
   * @param params
   */
  static async downloadFile(params: UndiciDownloadFileParams) {
    let { url, method = "GET", downloadPath } = params;
    const ext = path.extname(url);
    if (isFalsy(downloadPath)) {
      downloadPath = appConfig.tmpFilePath;
    }
    const { resolve, reject, promise } = Promise.withResolvers<string>();
    const res = await UndiciUtil.retry({ url, method });
    const writeFsPath = path.join(downloadPath, Nanoid.NumberNanoid() + ext);
    pipeline(res.body, fs.createWriteStream(writeFsPath), (err: NodeJS.ErrnoException | null) => {
      if (err) return reject(err);
      resolve(writeFsPath);
    });

    return await promise;
  }
}
