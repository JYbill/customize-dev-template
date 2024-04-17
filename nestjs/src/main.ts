import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception/global.filter';
import { ProjectExceptionFilter } from './common/exception/project.filter';
import { ParamsMissedException } from './common/exception/global.expectation';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // 入口日志器
  const logger = new Logger(bootstrap.name);

  // 全局配置
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new ProjectExceptionFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // JS字面量对象转换为class
      transformOptions: {
        enableImplicitConversion: true, // 隐式转换
      },
      whitelist: true, // 剔除在验证类中没有任何装饰器的属性(可以继续走业务)
      forbidNonWhitelisted: false, // 存在非白名单属性时停止处理请求，并抛出错误
      validationError: {
        value: true,
        target: true,
      },
      // 错误数据钩子
      exceptionFactory: (errors) => {
        logger.error('参数错误', errors);
        return new ParamsMissedException('参数错误');
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/`,
  );
}

bootstrap();
