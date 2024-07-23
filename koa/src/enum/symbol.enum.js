/**
 * 响应标识符，区别于其他的key，此key为`response-wrapper.js`定制了响应message的功能
 * ```ts
 * // controller
 * ctx.body = { [messageSymbol]: "消息内容" }
 *
 * // response-wrapper.js，会将其包装为
 * { "code": 200, "data": null, "message": "消息内容" }的格式扔给客户端
 * ```
 * @type {symbol}
 */
export const MessageSymbol = Symbol("message");
