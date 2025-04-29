import fs from "fs/promises";

import path from "node:path";

export class FsUtil {
  /**
   * 从source移动到dest，如果不存在指定目录则创建
   * @param source {string}
   * @param dest {string}
   * @param options
   * @param options.autoCreateDestFolder {boolean} 是否自动创建dest文件夹
   */
  static async move(source, dest, options = { autoCreateDestFolder: true }) {
    const { autoCreateDestFolder } = options;
    const destFolderPath = path.dirname(dest);
    const [[sourceError, sourceStat], [destFolderError, destFolderStat]] = await Promise.all([
      fs
        .stat(source)
        .then((res) => [null, res])
        .catch((error) => [error, null]),
      fs
        .stat(destFolderPath)
        .then((res) => [null, res])
        .catch((error) => [error, null]),
    ]);

    if (sourceError) {
      console.error(sourceError);
      throw new Error("source file is not exist!");
    } else if (destFolderError) {
      if (!autoCreateDestFolder) {
        console.error(destFolderError);
        throw new Error("dest folder is not exist!");
      }
      await fs.mkdir(destFolderPath);
    }

    await fs.rename(source, dest);
    return {
      source,
      dest,
    };
  }

  /**
 * 根据文件名删除临时文件夹目录的文件(都是同步操作效率不高，且需要制定临时目录地址)
 * @param filename
 * @return {Promise<void>}
 */
static delTempFileByName(filename) {
    const { logger } = this.ctx;
    const filePath = path.resolve(this.tempFilePath, filename);
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.isFile()) {
        // console.log(filePath, filename); // debug
        fs.unlinkSync(filePath);
      } else {
        logger.error(filename);
        logger.error(filePath);
        this.ctx.throw(400, "delTempFileByName()#删除的是非文件");
      }
    } catch (err) {
      logger.error("delTempFileByName()#该文件不存在，无需删除");
      logger.error(filePath);
    }
  }
  
  /**
  * 存储上传的文件流
  * @param readableStream
  * @returns
  * @description
  *  依赖：
  *    mime包：文件名读取MIME类型（推荐使用魔数读取）
  *  需要配置：baseDir(存储文件地址)
  */
  static async saveUploadFile(readableStream): Promise<boolean> {
   return new Promise((resolve) => {
     const baseDir = this.baseDir;
 
     // 随机文件名hash化
     const splitList = readableStream.filename.split(".");
     const suffix = splitList[splitList.length - 1];
     const filename = splitList.reduce((prev, curr, index) => {
       if (index === 0) {
         return curr;
       } else if (index === splitList.length - 1) {
         return prev;
       }
       return prev + "." + curr;
     }, "");
     const randomFilename = filename + "." + Math.random().toString(16).slice(2) + "." + suffix;
 
     // 通过文件名后缀获取MIME类型
     const mimeType = mime.getType(randomFilename);
 
     // uri
     const { href } = new URL(path.join(this.uploadTemp, randomFilename), this.ip);
     console.log(this.uploadTemp, randomFilename);
     console.log(href);
     // 流写入
     const filepath = path.resolve(baseDir, "app", this.uploadTemp, randomFilename);
     const ws = fs.createWriteStream(filepath);
     ws.on("close", () =>
       resolve({
         filepath,
         originFileName: readableStream.filename,
         filename: randomFilename,
         url: href,
         mime: mimeType,
       }),
     );
     ws.on("error", (err) => {
       this.ctx.logger.error(err);
       this.ctx.throw(400, "saveUploadFile()#文件本地存储错误");
     });
     readableStream.pipe(ws);
   });
 }
}
