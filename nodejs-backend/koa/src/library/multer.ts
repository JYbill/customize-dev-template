/**
 * @Description: koa-multer全局配置
 * @Date: 2024/6/25 17:51
 */
import { config } from "#config";

import multer from "@koa/multer";

import type { IncomingMessage } from "node:http";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { HttpError } from "#error/index.ts";
import { globalLogger } from "#logger";
import UploadUtil from "#service/upload/util.ts";
import { isTrusty } from "#utils/lodash.util.ts";

const logger = globalLogger.child({ fileFlag: "library/multer" });
const appConfig = config.application;

const storage = multer.diskStorage({
  destination: function (_req: IncomingMessage, _file, cb) {
    const projectDir = appConfig.projectPath;
    const storagePath = path.resolve(projectDir, "tmp");
    cb(null, storagePath);
  },
  filename: function (_req: IncomingMessage, file, cb) {
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf-8");
    const randomFilename = UploadUtil.renameFilename(file.originalname);
    cb(null, randomFilename);
  },
});

/**
 * 文件上传进度记录器
 * @param req
 * @param file
 */
const uploadLogger = (req: IncomingMessage, file: multer.File) => {
  const originalName = file.originalname;
  const contentLength = req.headers["content-length"];
  let now = performance.now();
  let byteLens = 0;
  req
    .on("data", (data: Buffer) => {
      byteLens += data.length;
      if (performance.now() - now <= 300) return;

      if (isTrusty(contentLength)) {
        // http规范，拿得到content-length
        logger.info(
          `upload ${originalName} progress=${((byteLens / Number.parseInt(contentLength)) * 100).toFixed(2)}%`,
        );
      } else {
        // http不规范
        logger.info(`upload ${originalName} progress, current=${byteLens}byte`);
      }
      now = performance.now();
    })
    .on("error", (err: Error) => {
      logger.error(`upload ${originalName} file error`, err);
    })
    .on("end", () => {
      logger.info(`upload end, originName=${originalName}, byte=${byteLens}`);
    });
};

export default multer({
  storage,
  fileFilter: (req: IncomingMessage, file: multer.File, cb) => {
    const body = req["body"] as { includesSuffix: string };
    const originalname = file.originalname;
    const fileSuffix = path.extname(originalname).replace(".", "").toLowerCase();

    // 前端限制文件后缀
    let includesSuffixStr: string = body["includesSuffix"];
    if (isTrusty(includesSuffixStr)) {
      if (!/^\[.*]$/.test(includesSuffixStr)) {
        cb(HttpError.throwRequestError("includesSuffixStr must is array string type"), false);
        return;
      }
      let includesSuffix = JSON.parse(includesSuffixStr) as string[];
      includesSuffix = includesSuffix.map((item) => item.toLowerCase()); // 全部转小写匹配
      if (!includesSuffix.includes(fileSuffix)) {
        cb(HttpError.throwRequestError("the frontend does not allow this file type"), false);
        return;
      }
    }

    // 后台不允许
    if (!UploadUtil.checkFileExt(originalname)) {
      cb(HttpError.throwRequestError("backend file type not allow"), false);
      return;
    }

    // 开始日志打印
    uploadLogger(req, file);

    // 合法文件，允许上传
    cb(null, true);
  },
});
