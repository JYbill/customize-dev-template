import { ConfigurableModuleBuilder, Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";
import type { Prisma } from ".prisma/client";
import { prismaFactory } from "@/common/modules/prisma/prisma";

/**
 * 模块构建器
 */
export type IPrismaModule = {
  isGlobal?: boolean; // 默认为true
  debugging?: boolean; // debug模式，默认false
  prismaOpt?: Prisma.PrismaClientOptions;
};
export type PrismaConfigType = typeof OPTIONS_TYPE;

export const PRISMA_TOKEN = Symbol("Prisma");
const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: _ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<IPrismaModule>()
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => {
      return { ...definition, global: extras.isGlobal };
    },
  )
  .build();

@Module({})
export class PrismaModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const { module, providers, global } = super.register(options);
    return {
      module,
      providers: [
        ...providers!,
        {
          provide: PRISMA_TOKEN,
          useFactory: prismaFactory,
          inject: [MODULE_OPTIONS_TOKEN],
        },
      ],
      global,
      exports: [PRISMA_TOKEN],
    };
  }
}
