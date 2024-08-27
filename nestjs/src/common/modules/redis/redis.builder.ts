/**
 * @Description: redis 动态模块构建器
 * @Date: 2024/8/27 10:14
 */
import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { RedisService } from './redis.service';

export interface IConfig {
  flag: string;
  key: string;
}

export const {
  ConfigurableModuleClass, // 动态模块需要继承的类
  MODULE_OPTIONS_TOKEN, // 动态模块注册时的传参标识，用于@Inject(MODULE_OPTIONS_TOKEN)注入给动态模块service
} = new ConfigurableModuleBuilder()
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => {
      definition.providers.push(RedisService);
      return {
        ...definition,
        global: extras.isGlobal,
        exports: [RedisService],
      };
    },
  )
  .build();

export class RedisModule extends ConfigurableModuleClass {}
