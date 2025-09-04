import { PrismaServiceFactory } from "../ioc/prismaFactory";
import { PrismaClient } from "@prisma/client";

import { ILogger, InjectClient } from "@midwayjs/core";
import { Inject, Logger, Provide, ScopeEnum } from "@midwayjs/decorator";

@Provide(ScopeEnum.Singleton)
export class PrismaService {
  @InjectClient(PrismaServiceFactory, "mongo") // 一定要指明实例名，否则默认与Class同名！
  prisma: PrismaClient;

  @Logger()
  logger: ILogger;

  async testPrisma() {
    return await this.prisma.user.findMany();
  }
}
