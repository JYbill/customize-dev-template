/**
 * @Description: koa-multer全局配置
 * @Date: 2024/6/25 17:51
 */
import { config } from "#config";
import multer from "@koa/multer";
import path from "node:path";
import HttpError from "#utils/exception.util.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectDir = appConfig.projectPath;
    const storagePath = path.resolve(projectDir, "tmp");
    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    const randomFilename = Date.now() + "." + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, randomFilename + extname);
  },
});

export default multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});
