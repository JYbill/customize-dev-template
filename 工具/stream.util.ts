import { ReadableStream, TextDecoderStream, TransformStream, type TransformerTransformCallback } from "node:stream/web";
import { pipeline } from "stream/promises";
import { Duplex, Readable } from "node:stream";
import { PipelineSource, PipelineTransform } from "stream";
import type { Response } from "express";

export class StreamUtil {
  /**
   * 将web readable Stream -> TextDecoderStream解码utf8二进制为字符串类型 -> 自定义转换流逻辑
   * @param readableStream
   * @param transformerCallback
   * @example
   * ```ts
   * // 使用转换流
   * let jsonCache = "";
   * const pipeStream = StreamUtil.webReadablePipeTransform(body, (chunk, controller) => {
   *   if (chunk.includes("event: ping")) return;
   *   jsonCache += chunk;
   *   if (jsonCache.endsWith("\n")) {
   *     controller.enqueue(jsonCache);
   *     jsonCache = "";
   *   }
   * });
   * // 响应给response对象
   * pipeStream.pipeTo(response);
   * ```
   */
  static webReadablePipeTransform(
    readableStream: ReadableStream,
    transformerCallback: TransformerTransformCallback<string, string>,
  ) {
    return readableStream.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TransformStream({
        transform: transformerCallback,
      }),
    );
  }

  /**
   * node.js 可读流管道到transform转换流 -> response可写流
   * 注意：如果调用该函数，意味着做好了结束任何响应的准备，因为response一旦写入就无法再更改response.header等其他字段
   * @example
   * ```ts
   * const body = await this.chatService.reqChatMessages();
   *   await StreamUtil.nodejsReadablePipeTransform(
   *      Readable.from(body),
   *      async function* (source) {
   *        for await (const chunk of source) {
   *          const buffer = chunk.toString();
   *          yield buffer;
   *        }
   *      },
   *      res,
   *    );
   * ```
   */
  static async nodejsReadablePipeTransform(
    readable: Readable,
    transformer: PipelineTransform<() => string, string>,
    res: Response,
  ) {
    return await pipeline(
      readable,
      Duplex.fromWeb(new TextDecoderStream()),
      // 自定义转换流
      transformer,
      res,
    );
  }
}
