/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { AccountDTO } from "@/common/dto/account.dto";
import { DBExpectation } from "@/common/exception/global.expectation";
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { type PrismaOptType, MODULE_OPTIONS_TOKEN } from "./prisma.builder";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private $customExtends: ReturnType<typeof extendsFactory>;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly prismaOpt: PrismaOptType,
    private readonly configService: ConfigService<IEnv>,
  ) {
    super(prismaOpt.prismaOpt);

    // debug详细内容
    if (this.prismaOpt.debugging) {
      this.$on("query", (event: Prisma.QueryEvent) => {
        const date = new Date(event.timestamp);
        this.logger.debug(`请求时间: ${date.toLocaleTimeString()}`);
        this.logger.debug(`耗时: ${event.duration + "ms"}`);
        this.logger.debug(`DB SQL: ${event.query}`);
        if (!event.target.includes("mongodb")) {
          this.logger.debug(`SQL 参数: ${event.params}`);
        }
        this.logger.debug("\n");
      });
    }
  }

  get $GlobalExt() {
    if (!this.$customExtends) {
      this.$customExtends = extendsFactory(this);
    }
    return this.$customExtends;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Prisma Connected");
    } catch (err) {
      this.logger.error("Nest onModuleInit Error");
      console.log(err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Prisma Disconnected");
  }
}

/**
 * 扩展Prisma $extends 工厂函数
 * @param prisma
 */
function extendsFactory(prisma: PrismaService) {
  const $extends = prisma.$extends({
    name: "GlobalExtends",
    model: {
      $allModels: {
        /**
         * 根据条件查询是否存在
         */
        async exit<Module>(this: Module, where: Prisma.Args<Module, "findFirst">["where"]): Promise<boolean> {
          const context = Prisma.getExtensionContext(this) as Module;
          const data = await context["findFirst"]({
            where,
            select: { id: true },
          });
          return !!data;
        },

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

      account: {
        /**
         * 查找用户带明文密码
         * @param where
         * @param select
         */
        async findUserWithPWD<Module>(
          this: Module,
          where: Prisma.Args<Module, "findFirst">["where"],
          select?: Prisma.Args<Module, "findFirst">["select"],
        ) {
          const context = Prisma.getExtensionContext(this) as Module;
          const res = await context["findFirst"]({
            where,
            select,
            showPWD: true,
          });
          return res as AccountDTO;
        },
      },
    },
    query: {
      $allModels: {
        /**
         * 自定义Prisma异常
         * @param params
         */
        async $allOperations(params) {
          const { args, query, operation } = params;
          try {
            if (operation.includes("create")) {
              return await query(args);
            }

            // 所有判断条件都必须满足有逻辑删除条件
            // 有where条件但没有isDelete就默认加上
            if (args["where"]) {
              if (!args["where"]["isDelete"]) {
                args["where"]["isDelete"] = false;
              }
            } else {
              // 完全没有where条件，直接设置isDelete
              args["where"] = {
                isDelete: false,
              };
            }
            return await query(args);
          } catch (err) {
            const error = err as Error;
            if (error instanceof PrismaClientKnownRequestError) {
              throw new DBExpectation(error.message);
            } else {
              console.error("Prisma Query Error", error);
            }
          }
        },
      },
      account: {
        /**
         * 所有用户的返回值，都将"password"字段混淆
         */
        async $allOperations(params) {
          const { args, query, operation } = params;
          try {
            if (operation.includes("create")) {
              return await query(args);
            }

            // 所有判断条件都必须满足有逻辑删除条件
            // 有where条件但没有isDelete就默认加上
            if (args["where"]) {
              if (!args["where"]["isDelete"]) {
                args["where"]["isDelete"] = false;
              }
            } else {
              // 完全没有where条件，直接设置isDelete
              args["where"] = {
                isDelete: false,
              };
            }
            return await query(args);
          } catch (err) {
            const error = err as Error;
            if (error instanceof PrismaClientKnownRequestError) {
              throw new DBExpectation(error.message);
            } else {
              console.error("Prisma Query Error", error);
            }
          }
        },
      },
    },
  });
  return $extends;
}
