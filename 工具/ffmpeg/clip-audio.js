  /**
   * ffmpeg音频剪辑处理器
   * @return {Promise<void>}
   */
  async function ffmpegAudioClipHandler() {
    const { promise, resolve, reject } = Promise.withResolvers();

    try {
      const { duration: audioTotalSeconds } = await this.#getMediaMetadata(audioPath);
      const saveAreas = this.#getSaveAreaByClipArea(this.clipArea, audioTotalSeconds);

      // 导出路径
      const { filename, ext } = this.getOriginFilenameByURLOrFilename(originFilename);
      const clipFilename = `${filename}-clip.${getRandomStrByNum()}${ext}`;
      const exportAudioPath = join(saveDir, clipFilename);

      // 剪辑音频ffmpeg命令
      const saveFilterList = saveAreas
        .map(([start, end], idx) => `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${idx}]`)
        .join(";");
      const concatList = saveAreas.map((_, idx) => `[a${idx}]`).join("") + `concat=n=${saveAreas.length}:v=0:a=1[outa]`;
      const complexFilterCommand = saveFilterList + ";" + concatList;

      // 开始剪辑
      ffmpeg(audioPath)
        .complexFilter(complexFilterCommand)
        .outputOptions("-map [outa]") // 映射输出音频流
        .output(exportAudioPath)
        .on("start", async (commandLine) => {
          logger.info("audio ffmpeg command: %s", commandLine);
          await ClipService.updateClipCommand(this.clipInfoId, ClipType.AUDIO, commandLine);
          await ClipDoing.creatClipAudioDoing({
            monitorId: this.monitorId,
            clipInfoId: this.clipInfoId,
            date: audioDate,
            url: this.#getStaticPath(clipFilename),
          });
        })
        .on("progress", ({ frames, currentFps, targetSize, timemark, percent }) => {
          this.audioProgress = Number(percent.toFixed(2));
          this.emit(ClipCoreEvent.PROGRESS);
        })
        .on("end", () => {
          logger.info("audio handle success");
          resolve();
        })
        .on("error", (err) => {
          logger.error("audio handle fail: %s", err);
          reject(err);
        })
        .run();
      await promise; // 等待剪辑音频完成

      // 删除下载audio
      await rm(audioPath);

      // 获取剪辑后的音频信息
      const { size: clipAudioSize, duration: clipAudioDuration } = await this.#getMediaMetadata(exportAudioPath);
      await ClipDoing.updateAudioDoing(this.clipInfoId, clipAudioSize, clipAudioDuration * 1000);
      await ClipService.updateClippingStatusById(this.clipInfoId, {
        type: ClipType.AUDIO,
        typeStatus: ClipStatus.DONE,
      });
    } catch (audioError) {
      const exception = audioError.stack || audioError.name;
      this.result.audio.exception = exception;
      this.result.audio.success = false;
      logger.error("剪辑音频文件异常");
      logger.error(exception);
      await ClipService.updateFailureInfoById(this.clipInfoId, {
        type: ClipType.AUDIO,
        exception,
      });
    }
    this.audioProgress = 100;
    this.emit(ClipCoreEvent.PROGRESS);
  }