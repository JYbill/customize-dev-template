/**
 * @Description: 读取环境变量，转换配置，封装统一配置
 * @Date: 2024/6/27 10:53
 */
import ms from "ms";

import { dirname, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { globalLogger } from "#logger";

import { configValidateSchema } from "./validate.ts";

const logger = globalLogger.child({ fileFlag: "config/index.js" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = process.env as Record<string, string>;
const srcRoot = resolve(__dirname, "..");
const appRoot = resolve(__dirname, "../../"); // 项目根目录

let configData = {
  /**
   * 项目配置
   */
  application: {
    port: parseInt(config.PORT),
    nodeEnv: config.NODE_ENV, // NODE_ENV 环境变量
    projectPath: resolve(srcRoot, ".."), // 项目根目录
    srcRoot, // src源码目录
    publicFilePath: resolve(appRoot, "public/files"), // 文件预览目录，会被nginx代理
    tmpFilePath: resolve(appRoot, "tmp"), // 临时文件存储路径
    configPath: resolve(srcRoot, "config"),
    baseUrl: config.BASE_URL,
    baseApiUrl: config.BASE_API_URL,
    socketUrl: config.SOCKET_URL,
    isDev: () => configData.application.nodeEnv !== "production",
  },

  /**
   * redis 连接配置
   */
  redisConn: {
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
    password: config.REDIS_PASSWORD,
    db: Number(config.REDIS_DB) || 0,
    enableAutoPipelining: true,
  },
  redisConfig: {
    answerDbNumber: Number(config.ANSWER_DB_NUMBER),
    queueDbNumber: Number(config.QUEUE_DB_NUMBER),
  },

  redlock: {
    REDLOCK_DURATION: parseInt(config.REDLOCK_DURATION || "1500"),

    // redlock最大尝试抢锁次数，默认10次。最大尝试抢锁时间 = 200ms(默认) * 10 = 2000ms(没有算惊群时间)
    // 一般300次就到达了1min
    REDLOCK_MAX_DURATION: Number.parseInt(config.REDLOCK_MAX_RETRY_COUNT) ?? 300,
  },

  // 项目认证授权相关
  auth: {
    SESSION_SECRETS: JSON.parse(config.SESSION_SECRETS) as string[],
    SESSION_MAX_AGE: ms(config.SESSION_MAX_AGE as ms.StringValue),
    MAX_RETRY_COUNT: Number.parseInt(config.MAX_RETRY_COUNT) || 0,
    ACCOUNT_FREEZE_SECONDS: Number(config.ACCOUNT_FREEZE_SECONDS) || 86400, // 默认冻结账号1天
    NONCE_EXPIRE: Number(config.NONCE_EXPIRE) || 60,
    jwtSecret: config.JWT_SECRET,
    tokenExpire: 259200, // 认证token过期时长，单位s，3天
  },

  /**
   * wzj对外暴露的api签名
   */
  apiSign: {
    WZJ_API_KEYS: JSON.parse(config.WZJ_API_KEYS) as string[],
    WZJ_API_SECRETS: JSON.parse(config.WZJ_API_SECRETS) as string[],
  },

  // OAuth登录
  oauth: {
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callback: config.CALL_BACK,
    oauthHost: config.OAUTH_HOST,
    oauthUrl: config.OAUTH_URL,
    tokenUrl: config.TOKEN_URL,
    userinfoUrl: config.OAUTH_USERINFO_URL,
    refreshUrl: config.OAUTH_REFRESH_URL,
    tempUrl: config.OAUTH_TEMP_TOKEN_URL,
    logoutUrl: config.OAUTH_LOGOUT_URL,
    notifyUrl: config.OAUTH_NOTIFY_URL,
    jsSDKUrl: config.OAUTH_JSSDK_URL,
    mediaUrl: config.OAUTH_MEDIA_URL,
    // 临时token URL地址
    tempTokenURL: posix.join(config.RPC_ORG_BASE_URL_FOR_FRONT, config.TEMP_TOKEN_ORG),
  },

  /**
   * mysql
   */
  mysql: {
    wzj: {
      host: config.MYSQL_HOST,
      port: Number.parseInt(config.MYSQL_PORT),
      user: config.MYSQL_USER,
      password: config.MYSQL_PASSWORD,
      database: config.MYSQL_DATABASE,
      connectionLimit: 10,
      multipleStatements: true,
      namedPlaceholders: true,
      timezone: "+00:00",
      flags: ["-FOUND_ROWS"],
    },
    log: {
      host: config.LOG_MYSQL_HOST,
      port: Number.parseInt(config.LOG_MYSQL_PORT),
      user: config.LOG_MYSQL_USER,
      password: config.LOG_MYSQL_PASSWORD,
      database: config.LOG_MYSQL_DATABASE,
      connectionLimit: 5,
      multipleStatements: true,
      namedPlaceholders: true,
      timezone: "+00:00",
      flags: ["-FOUND_ROWS"],
    },
  },

  /**
   * 本地存储 or 存储配置
   */
  oss: {
    ow365Url: config.OW365_URL,
    ow365Host: config.OW365_HOST,
    assetsPrefix: config.ASSETS_PREFIX,
    isCloudMode: config.STORAGE.toLowerCase() === "cloud",
    // 本地上传配置
    localSecret: config.LOCAL_UPLOAD_SECRET,
    localExpire: config.LOCAL_UPLOAD_EXPIRE
      ? ms(config.LOCAL_UPLOAD_EXPIRE as ms.StringValue)
      : ms("5m"),
    // OSS上传配置
    accessKeyId: config.OSS_ACCESS_KEY_ID,
    accessKeySecret: config.OSS_ACCESS_KEY_SECRET,
    bucket: config.OSS_BUCKET,
    region: config.OSS_REGION,
    cloudEndpoint: config.OSS_ENDPOINT, // 访问OSS地址
    callbackUrlPath: config.OSS_CALLBACK,
  },

  /**
   * xss配置
   */
  xss: {
    whiteList: {},
  },

  /**
   * zlmediakit配置
   */
  zlmediakit: {
    host: config.ZLMEDIAKIT_SECRET,
    ip: config.ZLMEDIA_IP,
    port: config.ZLMEDIA_PORT,
    appPush: "jkf_push",
    appPull: "jkf_pull",
    secret: config.ZLMEDIAKIT_SECRET,
    vhost: "__defaultVhost__",
    enableHLS: 1,
    enableMP4: 0,
    servePath: config.ZLMEDIAKIT_RECORD_VOLUME_PATH,
  },

  /**
   * 直播回放配置
   */
  liveRecord: {
    endpoint: "live.aliyuncs.com",
    Version: "2016-11-01",
    AccessKeyId: config.LIVE_RECORD_ACCESS_KEY_ID,
    AccessKeySecret: config.LIVE_RECORD_ACCESS_KEY_SECRET,
    Format: "json",
    AppName: "live",
    DomainName: config.LIVE_RECORD_DOMAIN_NAME,
    OssBucket: config.LIVE_RECORD_OSS_BUCKET,
    OssEndpoint: config.LIVE_RECORD_OSS_ENDPOINT,
    OssRegion: config.LIVE_RECORD_REGION,
    OssExpires: config.LIVE_RECORD_EXPIRES,
    OnDemand: 1,
    RecordFormat: {
      CycleDuration: config.LIVE_RECORD_CYCLE_DURATION,
      Format: "mp4",
      OssObjectPrefix: "record/{AppName}/{StreamName}/{Sequence}{EscapedStartTime}{EscapedEndTime}",
    },
    NotifyUrlPath: "api/v1/live-record/cb/notify",
    OnDemandUrlPath: "api/v1/live-record/cb/onDemand",
    NeedStatusNotify: config.LIVE_RECORD_NEED_STATUS_NOTIFY,
    OnDemandConfig: {
      Format: ["mp4"],
      NeedRecord: config.LIVE_RECORD_NEED_RECORD,
    },
  },

  front: {
    url: config.FRONT_URL,
    errorUrl: config.FRONT_ERROR_URL,
    oauthTokenUrl: config.FRONT_TOKEN_URL,
  },

  corpWechatFront: {
    url: config.CORP_WECHAT_FRONT_URL,
    errorUrl: config.CORP_WECHAT_FRONT_ERROR_URL,
    oauthTokenUrl: config.CORP_WECHAT_FRONT_TOKEN_URL,
  },

  /**
   * bullMQ相关配置
   */
  bullMQ: {
    BULLMQ_ATTENDANCE_START: Boolean(parseInt(config.BULLMQ_ATTENDANCE_START)),
    BULLMQ_COURSE_QUESTION_START: Boolean(parseInt(config.BULLMQ_COURSE_QUESTION_START)),
    BULLMQ_COURSEWARE_START: Boolean(parseInt(config.BULLMQ_COURSEWARE_START)),
    BULLMQ_HOMEWORK_START: Boolean(parseInt(config.BULLMQ_HOMEWORK_START)),
    BULLMQ_LIBRARY_START: Boolean(parseInt(config.BULLMQ_LIBRARY_START)),
    BULLMQ_QUESTION_START: Boolean(parseInt(config.BULLMQ_QUESTION_START)),
    BULLMQ_SPOC_START: Boolean(parseInt(config.BULLMQ_SPOC_START)),
    BULLMQ_AI_KNOWLEDGE_START: Boolean(parseInt(config.BULLMQ_AI_KNOWLEDGE_START)),
    BULLMQ_CLIP_START: Boolean(parseInt(config.BULLMQ_CLIP_START)),
    BULLMQ_LIVE_CLIP_START: Boolean(parseInt(config.BULLMQ_LIVE_CLIP_START)),
    BULLMQ_RECORD_EXEC_START: Boolean(parseInt(config.BULLMQ_RECORD_EXEC_START)),
    BULLMQ_WAVEFORM_START: Boolean(parseInt(config.BULLMQ_WAVEFORM_START)),
    BULLMQ_DISCUSSION_START: Boolean(parseInt(config.BULLMQ_DISCUSSION_START)),
    BULLMQ_TEAM_START: Boolean(parseInt(config.BULLMQ_TEAM_START)),
    BULLMQ_GRADE_CENTER_START: Boolean(parseInt(config.BULLMQ_GRADE_CENTER_START)),
    BULLMQ_API_LOG_START: Boolean(parseInt(config.BULLMQ_API_LOG_START)),
    BULLMQ_STATISTIC_START: Boolean(parseInt(config.BULLMQ_STATISTIC_START)),
    BULLMQ_CURRICULUM_MIGRATE_START: Boolean(parseInt(config.BULLMQ_CURRICULUM_MIGRATE_START)),
    BULLMQ_AUDIO_TRANSCRIPTION_START: Boolean(parseInt(config.BULLMQ_AUDIO_TRANSCRIPTION_START)),
  },

  /**
   * 知识库相关配置
   */
  rag: {
    host: config.RAG_HOST,
    apiKey: config.RAG_API_KEY,
    apiSecret: config.RAG_API_SECRET,
    fileCallbackUrl: config.RAG_FILE_CALLBACK_URL,
    questionCallbackUrl: config.RAG_QUESTION_CALLBACK_URL,
  },

  /**
   * RPC配置
   */
  rpc: {
    RPC_ORG_BASE_URL: config.RPC_ORG_BASE_URL,
    rpcOrgLiveStreamURL: posix.join(config.RPC_ORG_BASE_URL, config.RPC_ORG_LIVE_STREAM),
    rpcOrgLectureReplayURL: posix.join(config.RPC_ORG_BASE_URL, config.RPC_ORG_LECTURE_REPLAY),
    rpcOrgLectureReplaySubtitleURL: posix.join(
      config.RPC_ORG_BASE_URL,
      config.RPC_ORG_LECTURE_REPLAY_SUBTITLE,
    ),
    rpcOrgLectureReplayAIAnalysisURL: posix.join(
      config.RPC_ORG_BASE_URL,
      config.RPC_ORG_LECTURE_REPLAY_AI_ANALYSIS,
    ),
    rpcOrgLectureReplayTeachingMaterialURL: posix.join(
      config.RPC_ORG_BASE_URL,
      config.RPC_ORG_LECTURE_REPLAY_TEACHING_MATERIAL,
    ),
    rpcOrgLectureReplaySTDataURL: posix.join(
      config.RPC_ORG_BASE_URL,
      config.RPC_ORG_LECTURE_REPLAY_ST_DATA,
    ),
    rpcOrgLectureReplayEvaluationURL: posix.join(
      config.RPC_ORG_BASE_URL,
      config.RPC_ORG_LECTURE_REPLAY_EVALUATION,
    ),
    RPC_ORG_ACCESS_KEY: config.RPC_ORG_ACCESS_KEY,
    RPC_ORG_ACCESS_SECRET: config.RPC_ORG_ACCESS_SECRET,
  },

  /**
   * ffmpeg相关配置
   */
  ffmpeg: {
    dirPath: config.FFMPEG_DIR_PATH,
  },

  frontConfig: {
    FRONT_MAX_UPLOAD_SIZE: config.FRONT_MAX_UPLOAD_SIZE || "1g",
    // [当前时间, SPOC定时章节关闭时间]，单位ms，默认1min
    FRONT_SPOC_CLOSE_DURATION: Number.parseInt(config.FRONT_SPOC_CLOSE_DURATION) || 1000 * 60,
    // 前端课件学习PPT最小上报时长(单位ms)
    FRONT_SPOC_COURSEWARE_PPT_MIN_REPORT_DURATION:
      Number.parseInt(config.FRONT_SPOC_COURSEWARE_PPT_MIN_REPORT_DURATION) || 5000,
    // 前端课件学习进度上报间隔最大时长，>=该时间则后台会判定为无效上报
    FRONT_SPOC_COURSEWARE_ACCESS_MAX_DURATION:
      ms(config.FRONT_SPOC_COURSEWARE_ACCESS_MAX_DURATION as ms.StringValue) || ms("5m"),
    FRONT_COURSE_TEAM_COLORS: JSON.parse(config.FRONT_COURSE_TEAM_COLORS) as string[],
  },

  /**
   * 第三方推流配置
   */
  thirdPartyPushStream: {
    rtmpUrl: config.TPP_STREAM_RTMP_URL,
    streamKey: config.TPP_STREAM_KEY,
    zlmApi: config.TPP_STREAM_ZLM_API,
    zlmApp: config.TPP_STREAM_ZLM_APP,
    zlmClientId: config.TPP_STREAM_ZLM_CLIENT_ID,
  },

  /**
   * simple-flakeid配置
   */
  simpleFlake: {
    FLAKE_WORK_ID: parseInt(config.FLAKE_WORK_ID) ?? 1,
  },

  /**
   * 课堂活动配置
   */
  module: {
    apiLog: {
      API_LOG_MAX_CACHE_LEN: Number.parseInt(config.API_LOG_MAX_CACHE_LEN) || 50,
    },
    library: {
      LIBRARY_RECYCLE_TIME: ms(config.LIBRARY_RECYCLE_TIME as ms.StringValue),
    },
    team: {
      TEAM_ACTIVITY_MAX_TIME: ms((config.TEAM_ACTIVITY_MAX_TIME as ms.StringValue) || "1d"),
    },
    curriculum: {
      CURRICULUM_CERT_DIABLE_FIELDS: JSON.parse(
        config.CURRICULUM_CERT_DIABLE_FIELDS || "[]",
      ) as string[],
    },
  },

  /*
   * dify 单题答题配置
   */
  dify: {
    difyUrl: config.DIFY_URL,
    wfQuestionKey: config.WF_QUESTION_KEY,
    wfQuestionPartKey: config.WF_QUESTION_PART_KEY,
    wfQuestionReviewKey: config.WF_QUESTION_REVIEW_KEY,
    wfQuestionImportKey: config.WF_QUESTION_IMPORT_KEY,
  },
};

// console.log("env", configData.mysql); // debug专用
const validateRes = configValidateSchema.validate(configData, {
  allowUnknown: true,
  presence: "required",
  convert: true,
});
if (validateRes.error) {
  logger.error("配置文件校验错误, err: %s", validateRes.error.message);
  logger.error(validateRes.error.details[0]);
  throw new TypeError("环境变量文件不完整或填写错误");
}
// console.log("debug validated config", configData);

export { configData as config };
