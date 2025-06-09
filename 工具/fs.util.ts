import fs from "fs/promises";

import path from "node:path";

import { HttpError } from "#error/http-error.js";

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
      throw HttpError.throwServerError("source file is not exist!");
    } else if (destFolderError) {
      if (!autoCreateDestFolder) {
        console.error(destFolderError);
        throw HttpError.throwServerError("dest folder is not exist!");
      }
      await fs.mkdir(destFolderPath);
    }

    await fs.copyFile(source, dest);
    await fs.unlink(source);
    return {
      source,
      dest,
    };
  }

  /**
   * 移除指定的文件，如果该文件不存在则不做任何操作，如果希望文件不存在抛出错误请使用nodejs fs.rm()
   */
  static async remove(path, rmOptions) {
    if (!path) return;
    const { dontThrow = true, recursive = true } = rmOptions ?? {};
    await fs.rm(path, {
      force: dontThrow,
      recursive,
    });
  }

  /**
   * 递归创建目录
   * @param path
   * @return {Promise<string | undefined>}
   */
  static async mkDirRecursive(path) {
    return fs.mkdir(path, { recursive: true });
  }
}
