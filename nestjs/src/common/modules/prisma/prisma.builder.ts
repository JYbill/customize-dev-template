import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

export type IPrismaModule = {
  isGlobal?: boolean; // 默认为true
  debugging?: boolean; // debug模式，默认false
  prismaOpt?: Prisma.PrismaClientOptions;
};

/**
 * 模块构建器
 */
const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<IPrismaModule>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({ ...definition, global: extras.isGlobal }),
    )
    .build();
export { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN };

// 类型
export type PrismaOptType = typeof OPTIONS_TYPE;
export type PrismaASyncOptType = typeof ASYNC_OPTIONS_TYPE;
