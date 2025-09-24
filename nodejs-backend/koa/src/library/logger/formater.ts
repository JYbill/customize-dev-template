/**
 * @Description: 统一日志格式化输出
 * @Date: 2024/6/28 14:10
 */
import moment from "moment";
import { format } from "winston";

const { combine, errors, timestamp, splat, colorize, uncolorize, printf } = format;

/**
 * 日志格式
 */
const printer = printf((info) => {
  const { level, timestamp } = info;
  const fileFlag = info.fileFlag as string;
  const message = info.message as string;
  const stack = info.stack as string;
  // ⚠️ 模板字符串不要随意换行，行号都会有一个ANSI控制符
  const defaultLog = `[PID=${process.pid}] [${level}] [${fileFlag ?? "Global"}] ${message} ${stack ? "\n" + stack : ""}`;
  return defaultLog;
});

/**
 * 无色日志
 */
export function getFormat() {
  return combine(
    errors({ stack: true }),
    splat(),
    timestamp({ format: () => moment().format("YYYY-MM-DD HH:mm:ss") }),
    printer,
  );
}
