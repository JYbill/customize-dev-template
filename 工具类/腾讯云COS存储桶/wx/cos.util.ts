// cos.ts
const COS = require('cos-wx-sdk-v5');
import { Utils } from '../utils/util';
import { UploadFilesArgOP } from './interface/index';

class MyCOS {
  public AVATAR_PREFIEX: string = 'avatar/'; // 默认存储路径(头像)
  public BASE_COS_JAVA_KEY_SERVER: string = 'http://127.0.0.1:8080/qc/key'; // java 服务
  public BUCKET: string = 'myblogspringboot-1300326898';
  public REGION: string = 'ap-nanjing'; // 地区
  public cos: any;

  /**
 * 获取avatar/* 下的所有文件
 * @returns promise
 */
  public getBucket(): any {
    return new Promise((resolve: any): void => {
      this.cos.getBucket({
        Bucket: this.BUCKET,
        Region: this.REGION,
        Prefix: 'avatar/', // 这里传入列出的myblogspringboot-1300326898/avatar下的所有文件
      }, function (err: any, data: any) {
        err ? resolve(err) : '';
        resolve(data.Contents);
      });
    })
  }

  /**
   * 简单上传文件
   * @param f 
   * @param progress 
   * @returns 
   */
  public simpleUpload(f: WechatMiniprogram.ChooseFile, progress: Function): any {
    return new Promise((resolve: (value: unknown) => void) => {
      this.cos.postObject({
        Bucket: this.BUCKET,
        Region: this.REGION,
        Key: this.AVATAR_PREFIEX + Utils.randomFileName(f.name),
        FilePath: f.path,
        onProgress: function (progressData: any) {
          progress(progressData);
        }
      }, function (err: any, data: any) {
        resolve(err || data);
      });
    });
  }

  /**
* 上传单个文件
* @param key 文件上传路径
* @param path 本地文件路径
* @param taskReady 准备上传回调
* @param progress  上传进度回调
* @param fileFinish 上传完成回调
* @returns 
*/
  uploadFile(key: string, path: string, taskReady?: Function, progress?: Function, fileFinish?: Function): object {
    return new Promise(resolve => {
      this.cos.uploadFile({
        Bucket: this.BUCKET, /* 必须 */
        Region: this.REGION,     /* 存储桶所在地域，必须字段 */
        Key: key,              /* 必须 */
        FilePath: path,                /* 必须 */
        SliceSize: 1024 * 1024 * 20,     /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */

        // 非必须, 上传任务创建时的回调函数

        onTaskReady: function (taskId: number) {
          taskReady ? taskReady(taskId) : '';
        },

        // 上传文件的进度回调函数, 非必须
        onProgress: function ({ loaded, total, speed }: { loaded: number, total: number, speed: number }) {
          progress ? progress(loaded, total, speed) : '';
        },

        // 文件上传完成回调, 非必须
        onFileFinish: function (err: any, data: any, options: any) {
          fileFinish ? fileFinish(err, data, options) : '';
        },

      }, function (err: any, data: any) {
        err ? resolve(err) : resolve(data);
      });
    });
  }


  /**
   * 上传多个文件
   * @param files 
   * @param taskReady 
   * @param progress 
   * @param fileFinish 
   * @returns 
   */
  uploadMoreFile(files: WechatMiniprogram.ChooseFile[], taskReady?: Function, progress?: Function, fileFinish?: Function) {

    // 迭代浅拷贝
    const uploadFiles: UploadFilesArgOP[] = files.
      map((item: WechatMiniprogram.ChooseFile) => {
        return Object.assign(item, {
          FilePath: item.path,
          FileSize: item.size,
          Bucket: this.BUCKET,
          Region: this.REGION,
          Key: this.AVATAR_PREFIEX + Utils.randomFileName(item.name),
          onTaskReady(taskId: number) {
            taskReady ? taskReady(taskId) : '';
          }
        })
      });

    return new Promise((resolve: (value: unknown) => void) => {
      this.cos.uploadFiles({
        files: uploadFiles,
        SliceSize: 1024 * 1024 * 10,    /* 设置大于10MB采用分块上传 */

        // 进度回调
        onProgress: (info: any) => {
          console.log(info);
          progress ? progress(info.total, info.speed, info.percent) : '';
        },

        // 全部完成 or 出错回调
        onFileFinish: (err: any, data: any, options: any) => {
          fileFinish ? fileFinish(err || data, options) : '';
        },
      }, function (err: any, data: any) {
        resolve(err || data);
      });
    })
  }

  /**
   * 所有的COS任务
   */
  allTasks(): Array<any> {
    return this.cos.getTaskList();
  }

  /**
   * 清除指定任务
   * @param taskId 
   * @returns 
   */
  clearTask(taskId: string) {
    return this.cos.cancelTask(taskId);
  }

  /**
   * 暂停指定任务
   * @param taskId 
   */
  pauseTask(taskId: string) {
    this.cos.pauseTask(taskId);
  }


  /**
   * 重新开始指定任务
   * @param taskId 
   */
  reStartTask(taskId: string) {
    this.cos.restartTask(taskId);
  }
}
const myCos: MyCOS = new MyCOS();
/* myCos.cos = new COS({
  getAuthorization: function (options: any, callback: any) {
    // console.log('options', options);

    wx.request({
      url: myCos.BASE_COS_JAVA_KEY_SERVER,
      data: {},
      dataType: 'json',
      success: function (result: any) {
        var data = result.data.data;
        var credentials = data && data.credentials;
        if (!data || !credentials) return console.error('凭证无效...');
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          XCosSecurityToken: credentials.sessionToken,
          // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
          StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
        });
      }
    });
  }
}) */
myCos.cos = new COS({
  SecretId: '密钥',
  SecretKey: '密匙'
})
export default myCos;
