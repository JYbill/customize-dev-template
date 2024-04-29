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
import * as process from 'process';
import { RepositoryModule } from './repository/repository.module';
import { MenuModule } from './menu/menu.module';
import AdminMiddleware from './common/middleware/admin.middleware';

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
    PrismaModule.forRootAsync({
      useFactory: (): IPrismaModule => {
        return {
          isGlobal: true,
          // debugging: true,
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
    RepositoryModule,
    MenuModule,
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
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
