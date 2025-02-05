import type { PrismaConfigType } from "./prisma.module";
import { PrismaClient } from ".prisma/client";
import { Prisma } from ".prisma/client";
import { Logger } from "@nestjs/common";
import type { AccountDTO } from "@/common/dto/account.dto";
import { PrismaClientKnownRequestError } from ".prisma/client/runtime/library";
import { DBExpectation } from "@/common/exception/global.expectation";

export type PrismaExt = Awaited<ReturnType<typeof prismaFactory>>;

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
      account: {
        /**
         * 所有用户的返回值，都将"password"字段混淆
         */
        async $allOperations<T>(this: T, { args, query }) {
          // 存在"showPWD"返回真实的密码
          if (args["showPWD"]) {
            delete args["showPWD"];
            return query(args);
          }

          // 过滤密码
          const res = (await query(args)) as T;

          if (!(res instanceof Object)) return res;
          else if (Array.isArray(res)) {
            return res.map((user) => {
              user.password = "**********";
              delete user["salt"];
              return user;
            });
          } else {
            res["password"] = "**********";
            delete res["salt"];
          }
          return res;
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
