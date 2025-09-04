import { Injectable } from "@nestjs/common";
import undici from "undici";

@Injectable()
export class UndiciService {
  get undici() {
    return undici;
  }

  /**
   * 请求重试
   * @param params
   */
  async retryRequest<Response = any>(params: retryRequestPrams) {
    if (!params.headers) params.headers = {};
    if (!params.body) params.headers = {};
    const response = await undici.request<Response>(params.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...params.headers,
      },
      body: JSON.stringify(params.body),
      dispatcher: undici.getGlobalDispatcher().compose(
        undici.interceptors.retry({
          maxRetries: params.maxRetries ?? 3,
          minTimeout: 100,
          maxTimeout: params.maxTimeout ?? 5000,
          timeoutFactor: 2,
          retryAfter: true,
          statusCodes: [400, 401, 403, 404], // 针 对这些状态码重试
          methods: ["GET", "POST"],
          errorCodes: [
            "UND_ERR_REQ_RETRY",
            "ECONNRESET",
            "ECONNREFUSED",
            "ENOTFOUND",
            "ENETDOWN",
            "ENETUNREACH",
            "EHOSTDOWN",
            "EHOSTUNREACH",
            "EPIPE",
          ],
        }),
      ),
    });
    return response;
  }
}

export type retryRequestPrams = {
  url: string | URL;
  method: string;
  headers?: Record<string, any>;
  body?: Record<string, any>;
  maxRetries?: number; // 最大重试次数
  maxTimeout?: number; // 最大重试时间，超过即立即失败
};

export type RagAPIResponse = {
  code: number;
  data: Record<string, any>;
  message: string;
};
