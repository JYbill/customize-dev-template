/**
 * @Description: 统一配置
 * @Date: 2024/6/27 10:53
 */
import Joi from "joi";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  redis: {
    host: config.REDIS_HOST,
    post: Number(config.REDIS_PORT),
    password: config.PASSWORD,
  },

  /**
   * mysql
   */
  mysql: {
    host: config.MYSQL_HOST,
    port: Number(config.MYSQL_PORT),
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
    connectionLimit: 10,
    multipleStatements: false,
    namedPlaceholders: true,
    flags: ["-FOUND_ROWS"],
  },
});

// console.log("debug", configData); // debug
// 校验部分配置文件
const schema = Joi.object({
  redis: Joi.object({
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
