/**
 * @Description: ffmpeg全局入口文件，因为fluent-ffmpeg是一个单例模式的库，所以这里会对单例模式进行配置，避免分散文件导致覆盖问题
 * @Date: 2024/12/4 15:45
 */
import ffmpeg from "fluent-ffmpeg";

import { config } from "#config";

import { join } from "node:path";

const ffmpegConfig = config.ffmpeg;

if (ffmpegConfig.dirPath) {
  const ffmpegPath = join(ffmpegConfig.dirPath, "ffmpeg");
  const ffprobePath = join(ffmpegConfig.dirPath, "ffprobe");
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export { ffmpeg };
