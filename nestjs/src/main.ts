import { HttpStatus, Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { GlobalExceptionFilter } from "@/common/exception/global.filter";
import { ProjectExceptionFilter } from "@/common/exception/project.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import helmet from "helmet";
import Redis from "ioredis";
import RedisStore from "connect-redis";
import ms from "ms";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService<IEnv>);
  const logger = new Logger(bootstrap.name);

  const apiPrefix = configService.get("API_PREFIX");
  const port = configService.get("PORT");
  const sessionSecrets = configService.get("SESSION_SECRETS");
  const redisPrefix = configService.get("REDIS_PREFIX");
  const redisHost = configService.get("REDIS_HOST");
  const redisPort = configService.get("REDIS_PORT");
  const redisPassword = configService.get("REDIS_PASSWORD");
  const rememberExpire = configService.get<string>("SESSION_REMEMBER_EXPIRE");
  const rememberExpireTTL = ms(rememberExpire);

  // 全局配置
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // session
  const redisStoreClient = new RedisStore({
    client: new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
    }),
    prefix: `${redisPrefix}sid:`,
    ttl: rememberExpireTTL,
    disableTouch: false,
  });
  app.use(
    session({
      name: "oauth.sid",
      secret: JSON.parse(sessionSecrets),
      resave: false,
      rolling: false,
      saveUninitialized: false,
      store: redisStoreClient,
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
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      stopAtFirstError: true,
    }),
  );

  await app.listen(port || 3000);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}/`);
}

bootstrap();
