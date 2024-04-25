import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { GlobalModules } from '../global/global.modules';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GlobalModules,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<IEnv>) => ({
        storage: diskStorage({
          // 存放目录
          destination: join(
            config.get('APP_ROOT'),
            `assets/${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
          ),
          filename(_req, file, callback) {
            const filename = `${new Date().getTime()}.${file.mimetype.split('/')[1]}`;
            callback(null, filename);
          },
        }),
      }),
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
