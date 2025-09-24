import Joi from "joi";

export const configValidateSchema = Joi.object({
  redisConn: {
    host: Joi.string(),
    port: Joi.number(),
  },
  oauth: {
    clientId: Joi.string(),
    clientSecret: Joi.string(),
    callback: Joi.string(),
    oauthHost: Joi.string(),
    oauthUrl: Joi.string(),
    tokenUrl: Joi.string(),
    refreshUrl: Joi.string(),
    userinfoUrl: Joi.string(),
    tempTokenURL: Joi.string(),
  },
  mysql: {
    wzj: {
      host: Joi.string(),
      port: Joi.number(),
      user: Joi.string(),
      password: Joi.string(),
      database: Joi.string(),
    },
    log: {
      host: Joi.string(),
      port: Joi.number(),
      user: Joi.string(),
      password: Joi.string(),
      database: Joi.string(),
    },
  },
  redlock: {
    REDLOCK_DURATION: Joi.number(),
  },
  oss: {
    ow365Url: Joi.string(),
    assetsPrefix: Joi.string(),
    isCloudMode: Joi.boolean(),
    localSecret: Joi.string(),
    localExpire: Joi.number(),
  },
  zlmediakit: {
    host: Joi.string(),
    port: Joi.string(),
  },
  front: {
    url: Joi.string(),
    errorUrl: Joi.string(),
    oauthTokenUrl: Joi.string(),
  },
  bullMQ: {
    BULLMQ_ATTENDANCE_START: Joi.boolean(),
    BULLMQ_COURSE_QUESTION_START: Joi.boolean(),
    BULLMQ_COURSEWARE_START: Joi.boolean(),
    BULLMQ_HOMEWORK_START: Joi.boolean(),
    BULLMQ_LIBRARY_START: Joi.boolean(),
    BULLMQ_QUESTION_START: Joi.boolean(),
    BULLMQ_SPOC_START: Joi.boolean(),
    BULLMQ_DISCUSSION_START: Joi.boolean(),
  },
  rpc: {
    RPC_ORG_BASE_URL: Joi.string(),
    RPC_ORG_ACCESS_KEY: Joi.string(),
    RPC_ORG_ACCESS_SECRET: Joi.string(),
  },
  frontConfig: {
    FRONT_MAX_UPLOAD_SIZE: Joi.string(),
  },
});
