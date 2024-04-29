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
              const extensionArr = file.originalname.split('.');
              const extension = extensionArr[extensionArr.length - 1];
              const filename = `${new Date().getTime()}.${extension}`;
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
