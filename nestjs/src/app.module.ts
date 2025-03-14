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
import { UndiciModule } from "@/common/modules/undici/undici.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [process.env.NODE_ENV === "production" ? "env/.production.env" : "env/.development.env", "env/.env"],
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
    MailerModule.forRootAsync({
      async useFactory(configService: ConfigService<IEnv>) {
        const MAIL_USER = configService.get("MAIL_USER");
        const MAIL_CODE = configService.get("MAIL_CODE");
        const MAIL_HOST = configService.get("MAIL_HOST");
        const MAIL_PORT = configService.get("MAIL_PORT");
        const config: MailerOptions = {
          transport: {
            host: MAIL_HOST,
            port: MAIL_PORT,
            requireTLS: true,
            auth: {
              user: MAIL_USER,
              pass: MAIL_CODE,
            },
          },
          defaults: {
            from: `'No Reply' <no-reply@${MAIL_USER}>`,
          },
          preview: false,
        };
        return config;
      },
      inject: [ConfigService<IEnv>],
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
        plugins: [
            new ClsPluginTransactional({
            adapter: new TransactionalAdapterPrisma({
                prismaInjectionToken: PRISMA_TOKEN,
            }),
            enableTransactionProxy: true,
            }),
        ],
    }),
    MailerUtilModule,
    NanoidModule,
    GotModule,
    UserModule,
    UndiciModule,
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes("*splat");
    consumer.apply(LoggerMiddleware).forRoutes("*splat");
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
