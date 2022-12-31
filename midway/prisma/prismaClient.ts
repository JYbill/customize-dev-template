/**
 * @file: prismaClient.ts
 * @author: xiaoqinvar
 * @desc: v3.9.0+ 可以废弃
 * @dependencies:
 * @date: 2022-12-31 12:01:18
 */
import { PrismaServiceFactory } from "./prismaFactory";

import { IMidwayContainer, providerWrapper } from "@midwayjs/core";
import { ScopeEnum } from "@midwayjs/decorator";

export async function dynamicPrismaClientHandler(container: IMidwayContainer) {
  try {
    const prismaClient: PrismaServiceFactory = await container.getAsync("prismaServiceFactory");
    return prismaClient.get("mongo");
  } catch (error) {
    console.log(error);
  }
}

providerWrapper([
  {
    id: "prismaClient",
    provider: dynamicPrismaClientHandler,
    scope: ScopeEnum.Singleton, // 也可以设置为全局作用域，那么里面的调用的逻辑将被缓存
  },
]);
