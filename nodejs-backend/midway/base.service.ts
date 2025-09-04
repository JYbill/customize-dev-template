import { PrismaServiceFactory } from "../ioc/prismaFactory";

import { ILogger } from "@midwayjs/core";
import { Inject, Logger } from "@midwayjs/decorator";
import { Context } from "@midwayjs/koa";

export default class BaseService {
  @Inject()
  ctx: Context;

  @Logger()
  logger: ILogger;

  @Inject("prisma")
  prisma: PrismaServiceFactory["prisma"];

  @Inject("prismaExtends")
  extendPrisma: PrismaServiceFactory["extendPrisma"];
}
