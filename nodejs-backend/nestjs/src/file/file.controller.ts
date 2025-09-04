import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseUtil } from '../common/util/response.util';
import { ConfigService } from '@nestjs/config';
import { ParamsErrorException } from '../common/exception/global.expectation';

@Controller('file')
export class FileController {
  constructor(private readonly configService: ConfigService<IEnv>) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new ParamsErrorException('上传文件参数错误');
    const host = this.configService.get('HOST');
    let path = file.path;
    console.log('d', path);
    path = path.slice(path.indexOf('assets')).replaceAll('\\', '/');
    const fileInfo = {
      filename: file.filename,
      fileSize: file.size,
      unit: 'byte',
      uri: path,
      host,
      url: new URL(path, host),
    };
    return ResponseUtil.success(fileInfo);
  }
}
