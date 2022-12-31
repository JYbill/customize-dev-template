/**
 * @Description: v3.9.0 可以不在需要prismaClient动态注入
 * @Author: 小钦var
 * @Date: 2022/12/31 13:39
 */
import { PrismaClient } from "@prisma/client";

import { Autoload, Destroy, ILogger, ServiceFactory } from "@midwayjs/core";
import { Config, Init, Logger, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";

@Autoload() // v3.9.0 @InjectClient 无法初始化解决方案
@Provide()
@Scope(ScopeEnum.Singleton)
export class PrismaServiceFactory extends ServiceFactory<PrismaClient> {
  @Config("prismaConfig")
  prismaConfig;

  @Logger()
  logger: ILogger;

  prisma: PrismaClient;

  @Init()
  async init() {
    await this.initClients(this.prismaConfig);
    this.prisma = this.get("mongo");
    this.prisma.$on("beforeExit", this.beforeExit.bind(this));
    this.prisma.$on<any>("query", this.stdoutLog.bind(this));
    this.prisma.$connect();
    this.logger.info("Init Autoload PrismaServiceFactory completed.");
  }

  @Destroy()
  async stop() {
    await this.prisma.$disconnect();
  }

  /**
   * 创建客户端
   * @param config
   * @returns
   */
  protected createClient(config: any) {
    return new PrismaClient(config);
  }

  /**
   * 获取服务工厂名
   * @returns
   */
  getName() {
    return "prismaServiceFactory";
  }

  /**
   * prisma before exist hooks
   * 注意：一定要是异步，否则可能导致midway进程无法正常退出
   */
  async beforeExit() {
    this.logger.info("Close Mongo Prisma.");
  }

  stdoutLog(event: QueryEvent) {
    this.logger.info("请求时间: ", new Date(event.timestamp).toLocaleString());
    this.logger.info("耗时: ", event.duration + "ms");
    this.logger.info("DB SQL: ", event.query);
    if (!event.target.includes("mongodb")) {
      this.logger.info("SQL 参数: ", event.params);
    }
  }
}

/**
 * prisma query log event params
 */
type QueryEvent = {
  timestamp: Date;
  query: string; // Query sent to the database
  params: string; // Query parameters
  duration: number; // Time elapsed (in milliseconds) between client issuing query and database responding - not only time taken to run query
  target: string;
};
