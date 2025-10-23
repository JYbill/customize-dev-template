/**
 * @Description: Morgan日志库
 * @Date: 2024/6/25 16:45
 */
import Morgan from "koa-morgan";

import type { IncomingMessage, ServerResponse } from "node:http";

Morgan.token("realIP", (req: IncomingMessage, res: ServerResponse): string => {
  const clientIP = req.socket.remoteAddress as string;
  return (
    (req.headers["x-real-ip"] as string) || (req.headers["x-forwarded-for"] as string) || clientIP
  );
});
Morgan.token("PID", (req: IncomingMessage, res: ServerResponse) => {
  return String(process.pid);
});
const log: string[] = [];
log.push("[PID=:PID]");
log.push(":realIP");
log.push("[:method] :status :url :response-time ms");
log.push(":referrer");
log.push(":user-agent");
const logger = Morgan(log.join(" | "));
export default logger;
