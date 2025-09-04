import type { PrismaConfigType } from "./prisma.module";
import { PrismaClient } from ".prisma/client";
import { Prisma } from ".prisma/client";
import { Logger } from "@nestjs/common";
import { PrismaClientKnownRequestError } from ".prisma/client/runtime/library";
import { DBExpectation } from "@/common/exception/global.expectation";
import type { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma";

export type PrismaExt = Awaited<ReturnType<typeof prismaFactory>>;
export type PrismaTx = TransactionalAdapterPrisma<PrismaExt>;

const logger = new Logger("Prisma");
export const prismaFactory = async (config: PrismaConfigType) => {
  const client = new PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>(config.prismaOpt);
  const extClient = client.$extends({
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
         * （未实现）递归过滤已被逻辑删除的数据
         */
        async findManyExcludeDeleted<Module>(this: Module, filter: Prisma.Args<Module, "findMany">, excludeDel = true): Promise<Module> {
          const context = Prisma.getExtensionContext(this) as Module;

          /* 实现：将所有关联查询都过滤逻辑删除的数据
          while (whereFilter.select) {
            whereFilter = whereFilter.select;
          }
          */
          const data = await context["findMany"](filter);
          return data;
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
              // if (!args["where"]["isDelete"]) {
              //   args["where"]["isDelete"] = false;
              // }
            } else {
              // 完全没有where条件，直接设置isDelete
              // args["where"] = {
              //   isDelete: false,
              // };
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
  await extClient.$connect();

  // debug详细内容
  if (config.debugging) {
    client.$on("query", (event: Prisma.QueryEvent) => {
      const date = new Date(event.timestamp);
      logger.debug(`请求时间: ${date.toLocaleTimeString()}`);
      logger.debug(`耗时: ${event.duration + "ms"}`);
      logger.debug(`DB SQL: ${event.query}`);
      if (!event.target.includes("mongodb")) {
        logger.debug(`SQL 参数: ${event.params}`);
      }
      logger.debug("\n");
    });
  }
  return extClient;
};
