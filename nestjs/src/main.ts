import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { GlobalExceptionFilter } from "@/common/exception/global.filter";
import { ProjectExceptionFilter } from "@/common/exception/project.filter";
import { ParamsMissedException } from "@/common/exception/global.expectation";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService<IEnv>);
  const logger = new Logger(bootstrap.name);

  const apiPrefix = configService.get("API_PREFIX");
  const port = configService.get("PORT");
  const sessionSecrets = configService.get("SESSION_SECRETS");

  // 全局配置
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ["1"],
  });
  app.use(
    session({
      secret: JSON.parse(sessionSecrets),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "form-action": null,
        },
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(), new ProjectExceptionFilter());
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
      exceptionFactory: (errors) => {
        if (process.env.ENV?.startsWith("prod")) {
          logger.error("参数错误");
        } else {
          logger.error("参数错误", errors);
        }
        return new ParamsMissedException("参数错误");
      },
    }),
  );

  await app.listen(port || 3000);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}/`);
}

bootstrap();
