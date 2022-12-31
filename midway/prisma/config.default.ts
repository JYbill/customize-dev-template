import { MidwayConfig } from "@midwayjs/core";

// 服务工厂一定要配置实例，这里推荐多例
const prismaConfig = {
  default: {},
  clients: {
    mongo: {},
    mysql: {},
  },
};
export type prismaConfigType = typeof prismaConfig;

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: "1672397836689_1399",
  koa: {
    port: 7001,
  },
  prismaConfig: prismaConfig,
} as MidwayConfig;
