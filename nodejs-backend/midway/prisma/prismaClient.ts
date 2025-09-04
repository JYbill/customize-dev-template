/**
 * @file: prismaClient.ts
 * @author: xiaoqinvar
 * @desc: IOC动态注入prisma不同的客户端
 * @dependencies:
 * @date: 2022-12-31 12:01:18
 */
import { PrismaServiceFactory } from "./prismaFactory";

import { IMidwayContainer, providerWrapper } from "@midwayjs/core";
import { ScopeEnum } from "@midwayjs/decorator";

export async function dynamicPrismaClientHandler(container: IMidwayContainer) {
  try {
    const prismaClient: PrismaServiceFactory = await container.getAsync("prismaServiceFactory");
    return prismaClient.prisma;
  } catch (error) {
    console.log(error);
  }
}

export async function dynamicExtendPrismaClientHandler(container: IMidwayContainer) {
  try {
    const prismaClient: PrismaServiceFactory = await container.getAsync("prismaServiceFactory");
    return prismaClient.extendPrisma;
  } catch (error) {
    console.log(error);
  }
}

providerWrapper([
  {
    id: "prisma",
    provider: dynamicPrismaClientHandler,
    scope: ScopeEnum.Singleton,
  },
  {
    id: "prismaExtends",
    provider: dynamicExtendPrismaClientHandler,
    scope: ScopeEnum.Singleton,
  },
]);
