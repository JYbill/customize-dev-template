import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { validateConfig } from './common/config/config.validate';
import LoggerMiddleware from './common/middleware/log.middleware';
import { IPrismaModule } from './modules/prisma/prisma.builder';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import JwtMiddleware from './common/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        () => ({
          REFRESH_EXPIRE: '7d',
        }),
      ],
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
    PrismaModule.forRootAsync({
      useFactory: (): IPrismaModule => {
        return {
          isGlobal: true,
          async prismaOptFactory() {
            const prismaOption: Prisma.PrismaClientOptions = {};
            if (process.env['ENV'] === 'development') {
              prismaOption.log = ['query', 'info', 'warn', 'error'];
            }
            return prismaOption;
          },
        };
      },
    }),
    UserModule,
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
    consumer
      .apply(JwtMiddleware)
      .forRoutes('/user/updatePwd', '/user/createUser');
  }
}
