import type { Server } from "node:http";

let shutdownPromise: Promise<void> | undefined;

/** 停止接收新请求，三秒后关闭仍未结束的 HTTP 连接。 */
export function shutdownApplication(server: Server): Promise<void> {
  shutdownPromise ??= new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => server.closeAllConnections(), 3000);
    timeout.unref();
    server.close((error) => {
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve();
    });
  });
  return shutdownPromise;
}

/** HTTP 监听成功后注册进程退出信号。 */
export function registerShutdownListeners(server: Server): void {
  const onSignal = () => {
    void shutdownApplication(server).catch((error) => {
      console.error("HTTP 服务关闭失败", error);
      process.exitCode = 1;
    });
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
}
