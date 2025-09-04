import path from "node:path";

import { ffmpeg } from "#lib/ffmpeg/index.ts";
import { globalLogger } from "#logger";

const logger = globalLogger.child("service/ffmpeg");

export class FfmpegService {
  /**
   * 剪辑视频片段（不进行编解码）
   * @param dirPath 保存目录
   * @param inputFile
   * @param start
   * @param end
   * @param sliceFilename
   * @return {Promise<unknown>}
   */
  static async ffmpegClipVideo({ dirPath, inputFile, start, end, sliceFilename }) {
    const { promise, resolve, reject } = Promise.withResolvers();
    let commandLine = "";
    ffmpeg(path.resolve(dirPath, inputFile))
      .setStartTime(start)
      .setDuration(end - start)
      .outputOption("-c copy")
      .save(path.resolve(dirPath, sliceFilename))
      .on("start", (cmd) => {
        commandLine = cmd;
      })
      .on("end", () => {
        resolve({ commandLine });
      })
      .on("error", (error) => {
        logger.error("Ffmpeg Clip Error: %s", error);
        reject(error);
      });
    return promise;
  }

  /**
   * 根据fileList文件名合并视频片段
   * @param dirPath 文件临时保存、以及存储到目录
   * @param fileListName
   * @param concatFilename
   * @return {Promise<unknown>}
   */
  static async ffmpegConcatVideo(dirPath, fileListName, concatFilename) {
    const { promise, resolve, reject } = Promise.withResolvers();
    let commandLine = "";
    ffmpeg()
      .input(path.resolve(dirPath, fileListName))
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .save(path.resolve(dirPath, concatFilename))
      .on("start", (cmd) => {
        commandLine = cmd;
      })
      .on("end", () => {
        resolve({ commandLine });
      })
      .on("error", (err) => {
        logger.error("Ffmpeg Concat Error: %s", err);
      });
    return promise;
  }

  /**
   * 进行截图
   * @param path
   * @param outputFolder
   * @param filename
   */
  static executeFfmpegScreenshot = async (
    path: string,
    outputFolder: string,
    filename: string,
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      ffmpeg(path)
        .on("end", function () {
          console.log("executeFfmpegScreenshot: Frame extraction successful");
          resolve(true);
        })
        .on("error", function (err) {
          console.error("executeFfmpegScreenshot: Frame extraction error: ", err.message);
          reject(err);
        })
        .screenshots({
          // timestamps: ['20%'], 不写这里的时间，截图很诡异没有画面
          timestamps: ["00:00:00.500"], // 跳转到第0.5秒获取帧
          // @ts-ignore
          format: "jpg",
          filename: filename,
          folder: outputFolder,
          count: 1,
        });
    });
  };
}
