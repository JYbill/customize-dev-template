/**
 * @time 2022/5/18 11:21
 * @author xiaoqinvar
 * @desc VodService vod云点播相关业务
 * @dependence tencentcloud-sdk-nodejs
 */
const {vod} = require("tencentcloud-sdk-nodejs");
const Service = require("egg").Service;

class VodService extends Service {
  constructor(ctx) {
    super(ctx);

    // init
    const {config} = this;
    const cloudConfig = config.TCloud.clientConfig;
    this.TVodCloudClient = new vod.v20180717.Client(cloudConfig);

    // model
    this.PlayBack = ctx.model.PlayBack;
  }
  PlayBack = null;

  /**
   * 查询云点播文件
   * 条件：配置文件、用户动态参数
   * @return {Promise<void>}
   */
  async searchMedia({offset, limit, liveName = null, createTime = {}, timeRange = {}}) {
    const {config} = this;
    let vodSearchConfig = Object.assign(config.TCloud.vodConfig, {Offset: offset, Limit: limit});
    vodSearchConfig = JSON.parse(JSON.stringify(vodSearchConfig));
    vodSearchConfig.Names = [liveName]; // ['keyWorld and dont be null string']
    vodSearchConfig.CreateTime = createTime; // { After?: '', Before?: '' }
    // debug 配置参数
    // this.logger.debug(vodSearchConfig);
    return await this.TVodCloudClient.SearchMedia(vodSearchConfig);
  }

  /**
   * 转码发送请求给云点播同时修改☁️点播信息
   * @param neededTransportArr
   * @param text 文字水印为主持人名
   * @return {Promise<*>}
   */
  async processMediaTransport({ fileId, text }) {
    const {config} = this;

    // set TextContent
    config.TCloud.TranscodeTaskInput.WatermarkSet[0].TextContent = text;
    const param = {
      FileId: fileId,
      MediaProcessTask: {
        // 深拷贝
        TranscodeTaskSet: [{ ...config.TCloud.TranscodeTaskInput }],
      }
    }
    this.logger.debug('水印测试', param.MediaProcessTask.TranscodeTaskSet);
    return this.TVodCloudClient.ProcessMedia(param);
  }

  /**
   * 修改云点播文件信息
   * @param fileId 云点播文件id
   * @param desc 云点播描述
   * @param fileName 文件名
   * @return {Promise<*>}
   */
  async modifyMediaInfo({fileId, desc, fileName}) {
    const param = {FileId: fileId, Description: desc, Name: fileName};
    return this.TVodCloudClient.ModifyMediaInfo(param);
  }

  /**
   * 删除云点播媒体文件
   * @param id
   * @return {Promise<void>}
   */
  async deleteMediaFile(id) {
    return this.TVodCloudClient.DeleteMedia({
      FileId: id
    });
  }

}

module.exports = VodService;