import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./prisma.builder";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule extends ConfigurableModuleClass {}
