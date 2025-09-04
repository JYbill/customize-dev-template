import type { Prisma } from "@prisma/client";

import { MidwayConfig } from "@midwayjs/core";

// prisma配置
const prismaDefaultConf: Prisma.PrismaClientOptions = {
  log: [
    { level: "query", emit: "event" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
};
const prismaConfig = {
  default: prismaDefaultConf,
  clients: {
    mongo: {},
    mysql: {},
  },
};

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: "1672397836689_1399",
  koa: {
    port: 7001,
  },
  prismaConfig: prismaConfig,
} as MidwayConfig;
