import { globalLogger } from "#logger";
import type { EmitWithRetryParams } from "#types/ws/util.d.ts";

const logger = globalLogger.child({ fileFlag: "ws/utils/ws.util.ts" });

export default class WSUtil {
  /**
   * 重试emit ack
   * @param namespace
   * @param roomId
   * @param event
   * @param payload
   * @param retries 默认重试3次
   * @param timeout
   */
  static async emitAckRetry<Response = any>({
    namespace,
    roomId,
    event,
    payload,
    retries = 10,
    timeout = 5000,
  }: EmitWithRetryParams): Promise<Response | undefined> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = (await namespace
          .to(roomId)
          .timeout(timeout)
          .emitWithAck(event, payload)) as Response;
        return response; // 成功则返回
      } catch (err) {
        logger.warn("emitWithRetry event=%s | roomId=%s | retryTimes:%s ", event, roomId, attempt);
        if (attempt === retries) throw err; // 最后一次失败则抛出
      }
    }
  }

  /**
   * 给房间内的每个socket实例都发送ACK应答消息
   * @param params
   */
  static async emitAckFromRoom(params: EmitWithRetryParams) {
    const { namespace, roomId } = params;
    const sockets = await namespace.to(roomId).fetchSockets();
    const sids = sockets.map((item) => item.id);
    const parallels = sids.map((_sid) => this.emitAckRetry(params));
    await Promise.all(parallels);
  }
}
