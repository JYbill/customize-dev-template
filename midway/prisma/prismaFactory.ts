/**
 * @Description: 推荐做成普通IOC，多prisma配置直接在该文件中
 *    可以抽成`serviceFactory`方式，相对来说比较麻烦，需要自己在init中手动对`clients`进行set prisma client extends扩展
 * @Author: 小钦var
 * @Date: 2022/12/31 13:39
 */
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { Autoload, Destroy, Init } from "@midwayjs/core";
import type { ILogger } from "@midwayjs/core";
import { Logger, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class PrismaServiceFactory {
  @Logger()
  logger: ILogger;

  prisma: ReturnType<typeof this.initPrisma>;
  extendPrisma: ReturnType<typeof this.extendAllPrisma>;

  @Init()
  async init() {
    this.prisma = this.initPrisma();
    // 扩展客户端
    this.extendPrisma = this.extendAllPrisma();
    // 连接db
    await this.connect();
    this.logger.info("Init Autoload PrismaServiceFactory completed.");
  }

  initPrisma() {
    const prisma = new PrismaClient({
      log: [
        { level: "query", emit: "event" },
        { emit: "stdout", level: "error" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
      ],
    });
    // 退出前钩子
    prisma.$on("beforeExit", this.beforeExit.bind(this));
    // 日志钩子
    prisma.$on("query", this.stdoutLog.bind(this));
    return prisma;
  }

  /**
   * 对prisma所有模型进行扩展
   */
  extendAllPrisma() {
    // $extends 4.7+ 且需要配置schema文件开启新特性
    const allPrisma = this.prisma.$extends({
      model: {
        $allModels: {
          /**
           * 对象排除
           * @param payload
           * @param keys
           */
          exclude<T, Key extends keyof T>(payload: T, keys: Key[]): Omit<T, Key> {
            for (const key of keys) {
              delete payload[key];
            }
            return payload;
          },

          /**
           * 数组排除
           * @param payloadList
           * @param keys
           */
          excludeAll<T, Key extends keyof T>(payloadList: T[], keys: Key[]): Omit<T, Key>[] {
            for (const payload of payloadList) {
              for (const key of keys) {
                delete payload[key];
              }
            }
            return payloadList;
          },
        },
      },
    });
    return allPrisma;
  }

  /**
   * prisma退出前钩子
   */
  async beforeExit() {
    this.logger.info("Before Close Prisma Client.");
  }

  /**
   * db执行日志
   * @param event
   */
  stdoutLog(event: Prisma.QueryEvent) {
    const date = new Date(event.timestamp);
    this.logger.info("请求时间: ", date.toLocaleTimeString());
    this.logger.info("耗时: ", event.duration + "ms");
    this.logger.info("DB SQL: ", event.query);
    if (!event.target.includes("mongodb")) {
      this.logger.info("SQL 参数: ", event.params);
    }
  }

  /**
   * 连接db
   */
  async connect() {
    await this.prisma.$connect();
  }

  /**
   * 断开db连接
   */
  @Destroy()
  async stop() {
    await this.prisma.$disconnect();
    this.logger.info("Closed Prisma Client.");
  }
}
