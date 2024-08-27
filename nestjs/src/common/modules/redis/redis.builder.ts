/**
 * @Description: redis 动态模块构建器
 * @Date: 2024/8/27 10:14
 */
import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

const { ConfigurableModuleClass } = new ConfigurableModuleBuilder().build();

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule extends ConfigurableModuleClass {
  static register() {
    return {
      global: true,
      module: RedisModule,
    };
  }

  async getName() {
    return 'RedisModule';
  }
}
