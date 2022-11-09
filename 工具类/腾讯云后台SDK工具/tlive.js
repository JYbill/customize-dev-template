/**
 * @time 2022/5/18 11:21
 * @author xiaoqinvar
 * @desc 云直播接口
 * @dependence tencentcloud画d-sdk-nodejs
 */
const { live } = require("tencentcloud-sdk-nodejs");
const Service = require("egg").Service;

class TLiveService extends Service {
  constructor(ctx) {
    super(ctx);
    const { config } = this;
    const cloudConfig = config.TCloud.clientConfig;
    this.TLiveClient = new live.v20180801.Client(cloudConfig);
  }

  tLiveService;

  /**
   * 实时流状态查询
   * @param appName 推流路径，与推流和播放地址中的AppName保持一致，默认为 live。
   * @param domainName 您的推流域名。
   * @param streamName 流名称。
   * @param roomId 直播间号
   * @return {Promise<void>}
   */
  async describeLiveStreamState({ appName = "live", domainName, streamName }) {
    const { ctx, app } = this;
    // this.logger.debug(typeof streamName);
    const stateRet = await this.TLiveClient.DescribeLiveStreamState({
      AppName: appName,
      DomainName: domainName,
      StreamName: streamName,
    });
    this.logger.debug("流状态判断");
    return stateRet;
  }

  /**
   * 创建录制任务
   * @param streamName
   * @param appName
   * @param domain
   * @param endTime
   * @param templateId 云直播录制模板id
   * @return {Promise<void>}
   */
  async createRecordTask(streamName, appName = "live", domain, endTime, templateId) {
    const { ctx, app, logger, config } = this;
    if (!domain) {
      domain = config.TCloud.domain;
    }
    if (!endTime) {
      let date = Date.now() / 1000;
      date += 60 * 60 * 24;
      endTime = Math.floor(date);
      console.log("结束时间", endTime);
    }
    if (!templateId) {
      templateId = config.TCloud.cloudLiveRecordTemplate;
    }
    return this.TLiveClient.CreateRecordTask({
      StreamName: streamName,
      AppName: appName,
      DomainName: domain,
      EndTime: endTime,
      TemplateId: templateId,
    });
  }

  /**
   * 提前终止云直播录制
   * @param taskId
   * @return {Promise<void>}
   */
  async stopRecordTask(taskId) {
    return this.TLiveClient.StopRecordTask({
      TaskId: taskId,
    });
  }

  /**
   * 删除云录制任务
   * @param taskId
   * @return {Promise<*>}
   */
  async delRecordTask(taskId) {
    return this.TLiveClient.DeleteRecordTask({
      TaskId: taskId,
    });
  }

  /**
   * 录制任务列表
   * @return {Promise<void>}
   */
  async describeRecordTask(startTime, endTime, streamName, domain, name = "live") {
    const { ctx, app, logger, config } = this;
    if (!domain) {
      domain = config.TCloud.domain;
    }
    return this.TLiveClient.DescribeRecordTask({
      StartTime: startTime,
      EndTime: endTime,
      StreamName: streamName,
      DomainName: domain,
      AppName: name,
    });
  }
}

module.exports = TLiveService;
