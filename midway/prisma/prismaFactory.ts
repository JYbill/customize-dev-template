import { PrismaClient } from "@prisma/client";

import { ILogger, ServiceFactory } from "@midwayjs/core";
import { Config, Init, Logger, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";

@Provide("prismaClientServiceFactory")
@Scope(ScopeEnum.Singleton)
export class PrismaClientServiceFactory extends ServiceFactory<PrismaClient> {
  @Config("prismaConfig")
  prismaConfig;

  @Logger()
  logger: ILogger;

  @Init()
  async init() {
    await this.initClients(this.prismaConfig);
  }

  /**
   * 创建客户端
   * @param config
   * @returns
   */
  protected createClient(config: any): PrismaClient {
    return new PrismaClient(config);
  }

  /**
   * 获取服务工厂名
   * @returns
   */
  getName() {
    return "prismaClient";
  }
}
