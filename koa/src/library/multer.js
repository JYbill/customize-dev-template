/**
 * @Description: koa-multer全局配置
 * @Date: 2024/6/25 17:51
 */
import multer from "@koa/multer";
import path from "node:path";

// TODO
// const { checkMimeType, checkFileExt } = require("../utils/upload.util");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectDir = process.env.PROJECT_DIR;
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
    /*const { mimetype, originalname } = file;
    if (checkMimeType(mimetype) && checkFileExt(originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Not Allowed"));
    }*/
  },
});
