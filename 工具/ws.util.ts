import { globalLogger } from "#logger";
import type { EmitAckFromRoomParams, EmitWithRetryParams } from "#types/ws/util.d.ts";

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
    retries = 3,
    timeout = 500,
  }: EmitWithRetryParams): Promise<Response | undefined> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = (await namespace
          .to(roomId)
          .timeout(timeout)
          .emitWithAck(event, payload)) as Response;
        return response; // 成功则返回
      } catch (err) {
        if (attempt === retries) throw err; // 最后一次失败则抛出
        logger.warn("emitWithRetry event=%s | roomId=%s | retryTimes:%s ", event, roomId, attempt);
      }
    }
  }

  /**
   * 给房间内的每个socket实例都发送ACK应答消息
   * @param params
   */
  static async emitAckFromRoom(params: EmitAckFromRoomParams) {
    const { namespace, roomId, event, payload } = params;
    const sockets = await namespace.to(roomId).fetchSockets();
    const sids = sockets.map((item) => item.id);
    const parallels = sids.map((sid) =>
      this.emitAckRetry({
        namespace,
        roomId: sid,
        payload,
        event,
      }),
    );
    await Promise.all(parallels);
  }
}
