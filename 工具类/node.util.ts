/**
 * @time 2022/5/30 16:38
 * @author xiaoqinvar
 * @desc 常用node工具封装，文件、流、buffer、crypto
 * @dependence node
 */
import * as crypto from "crypto";

export class NodeUtil {
  /**
   * md5盐值加密返回结果字符串
   * @param text
   * @param salt
   */
  static md5SlotCrypto(text: string, salt: string = ""): string {
    return crypto
      .createHash("md5")
      .update(text + salt)
      .digest("hex");
  }

  /**
   * 获取当前node环境的ip地址
   * @returns ip string
   */
  static getCurrentIpAddress(): string {
    var interfaces = require("os").networkInterfaces();
    for (var devName in interfaces) {
      var inter = interfaces[devName];
      for (var i = 0; i < inter.length; i++) {
        var alias = inter[i];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
          return alias.address;
        }
      }
    }
  }

  /**
   * 返回包含中的下载文件名，默认下载不支持中文
   * @param filename 下载文件名支持中文
   * @returns
   */
  downloadFileName(filename: string) {
    return Buffer.from(filename).toString("binary");
  }
}

/**
 * 存储上传的文件流
 * @param readableStream
 * @returns
 */
export async function saveUploadFile(readableStream): Promise<boolean> {
  return new Promise((resolve) => {
    const baseDir = this.baseDir;
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
    // 流写入
    const filepath = path.resolve(baseDir, "app", this.uploadTemp, randomFilename);
    const ws = fs.createWriteStream(filepath);
    ws.on("close", () =>
      resolve({
        filepath,
        originFileName: readableStream.filename,
        filename: randomFilename,
      }),
    );
    ws.on("error", (err) => {
      this.ctx.logger.error(err);
      this.ctx.throw(400, "saveUploadFile()#文件本地存储错误");
    });
    readableStream.pipe(ws);
  });
}
