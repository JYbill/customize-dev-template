import { ffmpeg } from "#lib/ffmpeg/index.ts";
import { globalLogger } from "#logger";
import type { getMediaInfoReturn } from "#types/service/ffmpeg.d.ts";

const logger = globalLogger.child({ fileFlag: "ffmpeg/ffprobe" });

export default class FfprobeService {
  /**
   * ffprobe获取媒体信息
   * @param path
   */
  static async getMediaInfo(path: string) {
    const { promise, resolve, reject } = Promise.withResolvers<getMediaInfoReturn>();
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        logger.error(`ffprobe error, path=%s, %s`, path, err);
        reject(err);
        return;
      }

      // 提取时长信息（以秒为单位）
      const hasAudio = metadata.streams.some((stream) => stream.codec_type === "audio");
      const format = metadata.format;
      resolve({
        duration: format.duration ?? 0,
        size: format.size ?? 0,
        formatName: format.format_name ?? "",
        formatLongName: format.format_long_name ?? "",
        hasAudio,
      });
    });
    return await promise;
  }
}
