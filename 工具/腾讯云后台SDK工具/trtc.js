/**
 * @time 2022/5/18 11:21
 * @author xiaoqinvar
 * @desc TrtcService trtc实时音视频相关业务
 * @dependence tencentcloud-sdk-nodejs
 */
const {vod, trtc} = require("tencentcloud-sdk-nodejs");
const Service = require("egg").Service;

class TrtcService extends Service {
  constructor(ctx) {
    super(ctx);

    // init
    const {config} = this;
    const cloudConfig = config.TCloud.clientConfig;
    this.TRTCCloudClient = new trtc.v20190722.Client(cloudConfig);

    // model
    this.Live = ctx.model.Live;
  }

  Live = null;

  /**
   * 通过腾讯云trtc client开启直播混流
   * @param config
   * @param mixedParams
   * @param roomId
   * @param {{VideoHeight, VideoWidth, VideoFramerate, VideoBitrate}} mixedParams
   * @param {string} roomId
   */
  async openFlowByTRTCCloudClient({mixedParams, roomId, streamId, userId, screenShareId, mainUserId}) {
    const {config, logger} = this;
    // 深拷贝配置文件
    const params = JSON.parse(JSON.stringify(Object.assign(config.TCloud.StartMCUMixTranscodeConfig, {})));
    // params.RoomId = parseInt(roomId);
    params.StrRoomId = roomId;
    params.OutputParams.RecordId += `_${roomId}`;
    params.OutputParams.StreamId = streamId;
    params.EncodeParams = Object.assign(config.TCloud.StartMCUMixTranscodeConfig.EncodeParams, mixedParams);
    // params.LayoutParams.MainVideoUserId = screenShareId;


    // 画中画模式单独处理小画面布局参数
    if (params.LayoutParams.Template === 4) {
      delete params.LayoutParams.MainVideoUserId;
      delete params.LayoutParams.MainVideoStreamType;

      // 自定义布局排版参数
      const videoWidth = params.EncodeParams.VideoWidth;
      const videoHeight = params.EncodeParams.VideoHeight;
      const videoParam = {videoWidth, videoHeight};
      // 自定义布局排版处理器
      params.LayoutParams.PresetLayoutConfig = this.mixLayoutHandler(screenShareId, mainUserId, videoParam);
    }
    params.LayoutParams.MixVideoUids = mainUserId;
    logger.info('debug 混流参数', JSON.stringify(params));
    logger.info('debug 布局参数', JSON.stringify(params.LayoutParams));

    // 非必要错误直接返回
    try {
      // return await this.TRTCCloudClient.StartMCUMixTranscode(params);
      return await this.TRTCCloudClient.StartMCUMixTranscodeByStrRoomId(params);
    } catch (err) {
      return err;
    }
  }

  /**
   * 混流布局排版
   * @param screenId 屏幕分享id
   * @param userIdArr 主播id[]
   * @param videoParam 视频输出宽高参数
   */
  mixLayoutHandler(screenId, userIdArr, videoParam) {
    const {ctx, app, logger} = this;
    const {videoWidth, videoHeight} = videoParam;
    const presetLayoutConfig = [];

    // 无屏幕分享时，仅包含摄像头的混流布局
    // logger.info("screen id", screenId);
    if (!screenId) {
      const userTotal = userIdArr.length;
      let imageWidth, imageHeight;
      if (userTotal === 1) {
        // 但且仅当只有一名主播开摄像头时：占满整个屏幕
        imageWidth = videoWidth;
        imageHeight = videoHeight;
      } else if (userTotal === 2) {
        // 2位主播
        imageWidth = videoWidth / 2;
        imageHeight = videoHeight;
      } else if (userTotal <= 4) {
        // 3-4位主播
        imageWidth = videoWidth / 2;
        imageHeight = videoHeight / 2;
      } else if (userTotal <= 9) {
        // 8位主播
        imageWidth = videoWidth / 3;
        imageHeight = videoHeight / 3;
      } else {
        imageWidth = videoWidth / 4;
        imageHeight = videoHeight / 4;
      }

      // 向下取整
      imageWidth = Math.floor(imageWidth);
      imageHeight = Math.floor(imageHeight);
      // 算法：摄像头从左向右排列
      /*
      (0, 0)，(0, videoWidth)
      (1, 0), (1, videoWidth)
       */
      let row = 0;
      let x = 0;
      let y = imageHeight;
      for (const [index, userId] of userIdArr.entries()) {

        if (index === 0) {
          x = 0;
        } else {
          x += imageWidth;
        }
        // 剩余位置容不下一个流的布局时，换行
        // logger.info("剩余大小", videoWidth - x)
        if (videoWidth - x < imageWidth) {
          x = 0;
          row++;
        }
        presetLayoutConfig.push({
          UserId: userId,
          StreamType: 0,
          ImageWidth: imageWidth,
          ImageHeight: imageHeight,
          LocationX: x,
          LocationY: y * row,
          ZOrder: 1,
          RenderMode: 1,// 0为裁剪，1为缩放，2为缩放并显示黑底。不填默认为0
        });
      }
      return presetLayoutConfig;
    }

    // 有屏幕分享时的混流布局
    const imageWidth = 150;
    const imageHeight = 80;
    let y = videoHeight - imageHeight * 2;
    for (const [index, userId] of userIdArr.entries()) {
      const x = index * imageWidth;
      if (videoWidth - x < imageWidth) {
        y += imageHeight;
      }
      presetLayoutConfig.push({
        UserId: userId,
        StreamType: 0,
        ImageWidth: imageWidth,
        ImageHeight: imageHeight,
        LocationX: x,
        LocationY: y,
        ZOrder: 1,
      });
    }
    presetLayoutConfig.push({
      UserId: screenId,
      StreamType: 0,
      ImageWidth: videoWidth,
      ImageHeight: videoHeight,
    });
    return presetLayoutConfig;
  }

  /**
   * 真实关流逻辑通过sdk关流
   * @param roomId
   * @return {Promise<*>}
   */
  async closeFlowByTRTCCloudClient({roomId}) {
    const {config} = this;
    const stopMixedParams = {
      SdkAppId: config.TCloud.StartMCUMixTranscodeConfig.SdkAppId,
      // RoomId: parseInt(roomId)
      StrRoomId: roomId,
    };

    // 非必要错误
    try {
      // return await this.TRTCCloudClient.StopMCUMixTranscode(stopMixedParams);
      return await this.TRTCCloudClient.StopMCUMixTranscodeByStrRoomId(stopMixedParams);
    } catch (err) {
      return err;
    }
  }

  /**
   * 根据roomId解散群
   * @param roomId
   * @return {Promise<void>}
   */
  async dismissRoom(roomId) {
    const {config} = this;
    const sdkAppId = config.TCloud.StartMCUMixTranscodeConfig.SdkAppId;
    if (typeof roomId === 'string') {
      // roomId = Number.parseInt(roomId);
    }
    // this.logger.debug(typeof roomId, roomId);
    // return this.TRTCCloudClient.DismissRoom({
    return this.TRTCCloudClient.DismissRoomByStrRoomId({
      SdkAppId: sdkAppId,
      RoomId: roomId
    }).catch((error) => {
      this.logger.warn('提示：房间不存在不用关闭', error.message);
    });
  }

  /**
   * 根据房间和开始时间戳、结束时间戳获取之间的所有历史直播间
   * @param roomId 房间id 4010
   * @param startTime 开始时间戳 1590065777
   * @param endTime 结束时间戳 1590067777
   * @return {Promise<void>}
   */
  async describeRoomInformation(roomId, startTime, endTime) {
    const {logger, config} = this;
    const historyRooms = await this.TRTCCloudClient.DescribeRoomInformation({
      SdkAppId: config.TCloud.StartMCUMixTranscodeConfig.SdkAppId,
      StartTime: startTime,
      EndTime: endTime,
      RoomId: roomId,
    });
    if (historyRooms["DeprecatedWarning"]) {
      logger.warn(historyRooms["DeprecatedWarning"]);
    }
    return historyRooms["RoomList"];
  }

  /**
   * 查询用户某次通话内的进退房，视频开关等详细事件
   * @param commId CommId 根据describeRoomInformation()获取
   * @param startTime 开始时间戳 1590065777
   * @param endTime 结束时间戳 1590067777
   * @param userId 用户stream id
   * @param roomId 房间id
   * @return {Promise<*>}
   */
  async describeDetailEvent({commId, startTime, endTime, userId, roomId}) {
    const {ctx, app, logger} = this;
    // this.logger.debug(typeof streamName);
    const eventResult = await this.TRTCCloudClient.DescribeDetailEvent({
      CommId: commId,
      StartTime: startTime,
      EndTime: endTime,
      UserId: userId,
      RoomId: roomId,
    });
    return eventResult;
  }
}

module.exports = TrtcService;
