import winston, { createLogger, format, transports } from "winston";

import { getFormat } from "./formater.ts";

const {
  combine,
  timestamp,
  label,
  splat,
  colorize,
  uncolorize,
  errors,
  padLevels,
  printf,
  json,
  simple,
} = format;

const isDev = process.env.NODE_ENV !== "production";

/**
 * 日志实例
 * @link https://github.com/winstonjs/winston
 */
const logger = createLogger({
  level: "info",
  levels: winston.config.npm.levels,
  exitOnError: false, // Promise.reject 或 错误不会导致项目process.exit()
  format: getFormat(),
  transports: [
    // 异步上报
    /*new ReportTransport({ level: "error" }),*/
    // 同步打印
    new transports.Console({
      stderrLevels: ["error"],
      format: isDev ? colorize({ all: true }) : uncolorize(),
    }),
  ],
});

logger
  .on("error", (err) => {
    logger.error("logger error", err);
  })
  .on("finish", function () {
    console.log("Global Logger is end.");
  });
export { logger as globalLogger };
