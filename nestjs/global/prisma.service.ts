/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { Injectable, OnModuleInit } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import process from "process";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  constructor() {
    let clientConf: Prisma.PrismaClientOptions = {};
    if (process.env["NODE_ENV"] === "process") {
      clientConf = {
        log: ["query", "info", "warn", "error"],
      };
    }
    super(clientConf);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
