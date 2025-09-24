import { MessageSymbol } from "#enum/symbol.enum.ts";
import ResponseUtil from "#utils/response.util.ts";

/**
 * @Description: 响应结果包装中间件
 * @Date: 2024/7/9 13:53
 */
export default async function (ctx, next) {
  ctx.state.wrapper = true; // 默认启用包裹
  await next();
  // 抛出异常时不会执行，异常全部交给最上游的`ExceptionMiddleware`处理
  const response = ctx.response;
  const headers = response.headers;
  const contentType = headers["content-type"] ?? "";

  // 不处理
  if (!ctx.state.wrapper) return; // 当前ctx上下文，已指定取消包裹
  if ([301, 302, 304].includes(ctx.status)) return; // 忽略重定向、未更改
  if (contentType.includes("text")) return; // 返回的是文本内容
  if (contentType.includes("text/event-stream")) return; // 不处理事件流
  if (contentType.includes("application/zip")) return;
  if (Buffer.isBuffer(ctx.body)) return; // 不处理Buffer
  if (ctx.body === undefined || ctx.body === null) return; // 不处理任何内容都未返回的接口

  // 这里只会处理所有响应内容，并包装一层
  const statusCode = ctx.status;
  const responseData = ctx.body;

  // 自定义失败逻辑
  if (responseData.success === false) {
    ctx.body = ResponseUtil.error(responseData.message, statusCode);
    return;
  }

  // 自定义消息逻辑
  /*
    使用方法
    ctx.body = {
      [MessageSymbol]: "...",
    };
  */
  const symbols = Object.getOwnPropertySymbols(ctx.body);
  if (symbols.includes(MessageSymbol)) {
    ctx.body = ResponseUtil.success(null, ctx.body[MessageSymbol], statusCode);
    return;
  }

  // 成功消息
  ctx.body = ResponseUtil.success(responseData, undefined, statusCode);
}
