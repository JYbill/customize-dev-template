import { SocketError } from "#error/index.ts";
import { RedisStore } from "#lib/session/index.ts";
import { globalLogger } from "#logger";
import type { AppSocket } from "#types/library.d.ts";

const logger = globalLogger.child({ fileFlag: "ws/auth.middleware.js" });
const sessionConfig = {
  key: "wzj2.sid",
  maxAge: "session",
  autoCommit: true,
  httpOnly: true,
  signed: true,
  overwrite: true,
  secure: false,
  store: RedisStore,
};
/**
 * WS认证中间件
 * @param socket
 * @param next
 * @constructor
 */
async function WSAuthMiddleware(socket: AppSocket, next: (err?: Error) => void) {
  // return next();
  if (process.env.NODE_ENV === "production") {
    const cookieString = socket.handshake.headers.cookie!;
    const sessionId = getSessionIdFromCookie(cookieString, sessionConfig.key);
    if (!sessionId) {
      const error = SocketError.throwUnauthorizedError(socket, "ws sessionId not found");

      // throw error;
      return next(error);
    }
    const session = (await RedisStore.get(sessionId))!;

    const userinfo = session.userinfo;
    // let isLogin = !isFalsy(userinfo);
    if (!userinfo) {
      logger.warn("ws user not login");
      const error = SocketError.throwUnauthorizedError(socket, "ws user not login");

      // throw error;
      return next(error);
    }

    socket.data.accountId = userinfo.accountId;
    socket.data.teacherId = userinfo.teacherId;
    socket.data.studentId = userinfo.studentId;
    socket.data.state = { user: { ...userinfo } };
    logger.info(
      `ws user login | accountId=${socket.data.accountId} | teacherId=${socket.data.teacherId} | studentId=${socket.data.studentId}`,
    );
    return next();
  } else {
    // 开发环境下允许不登录
    socket.data.accountId = 6;
    socket.data.teacherId = 6;
    socket.data.studentId = 6;
    logger.info("ws user login in dev mode");
    return next();
  }
}
function getSessionIdFromCookie(cookie: string, key: string) {
  if (!cookie) return undefined;
  const match = cookie.match(new RegExp(`${key}=([^;]+)`));
  return match ? match[1] : undefined;
}
export default WSAuthMiddleware;
