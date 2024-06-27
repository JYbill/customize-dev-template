/**
 * @Description: 统一配置
 * @Date: 2024/6/27 10:53
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const config = process.env;
const srcRoot = resolve(__dirname, "..");

const configData = Object.freeze({
  /**
   * 项目配置
   */
  app: {
    port: Number(config.PORT),
    nodeEnv: config.NODE_ENV, // NODE_ENV 环境变量
    projectPath: resolve(srcRoot, ".."), // 项目根目录
    srcRoot, // src源码目录
    configPath: resolve(srcRoot, "config"),
  },

  /**
   * redis 连接配置
   */
  redisConn: {
    host: config.REDIS_HOST,
    post: Number(config.REDIS_PORT),
    password: config.PASSWORD,
  },

  /**
   * redis配置
   */
  redisConfig: {
    courseDbNumber: config.COURSE_DB_NUMBER,
    wechatDbNumber: config.WECHAT_DB_NUMBER,
    visitLogDb: config.VISIT_LOG_DB,
    teamDbNumber: config.TEAM_DB_NUMBER,
    classMonitorDbNumber: config.CLASS_MONITOR_DB_NUMBER,
    groupDiscussionDb: config.GROUP_DISCUSSION_DB,
    courseHomeworkDb: config.COURSE_HOMEWORK_DB,
    accessCheckDb: config.ACCESS_CHECK_DB,
    answerDbNumber: config.ANSWER_DB_NUMBER,
    selfStudyDbNumber: config.SELF_STUDY_DB_NUMBER,
    queueDbNumber: config.QUEUE_DB_NUMBER,
    examDbNumber: config.EXAM_DB_NUMBER,
  },

  // 邮件认证相关
  mailAuth: {
    maxRetryCount: config.MAX_RETRY_COUNT,
    accountFreezeSeconds: config.ACCOUNT_FREEZE_SECONDS,
  },

  // 项目认证授权相关
  auth: {
    noncePrefix: "nonce_key_",
    nonceExpire: 60,
    jwtSecret: "weixin-assistant",
    passwordSalt: "weixin_assistant",
    passwordExpire: "86400",
    registerExpire: 86400,
    tokenExpire: 259200, // 3天
    mobileTokenExpire: 18000,
    notices: {
      unregistered: "unregistered",
      migrating: "migrating",
    },
  },

  /**
   * mysql
   */
  mysql: {
    host: config.MYSQL_HOST,
    port: Number(config.MYSQL_PORT),
    user: config.MYSQL_USER,
    password: config.mysql_PASSWORD,
    database: config.MYSQL_DATABASE,
    connectionLimit: 10,
    multipleStatements: false,
    namedPlaceholders: true,
    flags: ["-FOUND_ROWS"],
  },
});

// 校验部分配置文件
const schema = Joi.object({
  redisConn: Joi.object({
    host: Joi.string().required(),
    post: Joi.number().required(),
  }),
  mysql: {
    host: Joi.string().required(),
    port: Joi.number().required(),
    user: Joi.string().required(),
    password: Joi.string().required(),
    database: Joi.string().required(),
  },
});
const validateRes = schema.validate(configData, { allowUnknown: true });
if (validateRes.error) {
  console.error(validateRes.error.details);
  throw new TypeError("环境变量文件不完整或填写错误");
}
export { configData as config };
