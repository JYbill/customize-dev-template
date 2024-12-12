import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { validateConfig } from './common/config/config.validate';
import LoggerMiddleware from './common/middleware/log.middleware';
import { IPrismaModule } from './common/modules/prisma/prisma.builder';
import { PrismaModule } from './common/modules/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import JwtMiddleware from './common/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import process from 'process';
import AdminMiddleware from './common/middleware/admin.middleware';
import { NanoidModule } from "@/common/modules/nanoid/nanoid.module";
import { GotModule } from "@/common/modules/got/got.module";

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env',
        isGlobal: true,
        cache: true,
        expandVariables: true,
        validate: validateConfig,
    }),
    JwtModule.register({
      global: true,
      secret: process.env['JWT_SECRET'],
      signOptions: {
        expiresIn: process.env['JWT_EXPIRE'],
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.qq.com',
        port: 587,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_CODE,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: false,
    }),
    PrismaModule.register({
      isGlobal: true,
      prismaOpt: {
        errorFormat: "pretty",
        log: [{ level: "query", emit: "event" }],
      },
      debugging: false, // 按需开启debug调试SQL，以及清理慢SQL（⚠️ SQL过多可能刷屏）
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService<IEnv>) => {
        return {
          isGlobal: true,
          readyLog: true,
          errorLog: true,
          config: {
            host: configService.get("REDIS_HOST"),
            port: configService.get("REDIS_PORT"),
            password: configService.get("REDIS_PASSWORD"),
            enableAutoPipelining: true,
          },
        };
      },
      inject: [ConfigService],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
    NanoidModule,
    GotModule,
    UserModule
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    // CLS中间件，手动注册避免因为nestjs路由版本控制，导致cls无法正确全局注册问题
    consumer.apply(ClsMiddleware).forRoutes("*");
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        '/user/updatePwd',
        '/user/createUser',
        '/repository/create',
        '/menu/create',
      );
    consumer
      .apply(AdminMiddleware)
      .forRoutes('/user/createUser', '/repository/create', '/menu/create');
  }
}
