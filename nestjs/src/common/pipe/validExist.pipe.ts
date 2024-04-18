import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ParamsMissedException } from '../exception/global.expectation';

@Injectable()
export class ValidExistPipe implements PipeTransform {
  // value 表示传入管道的值，metadata路由方法的元数据
  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) {
      throw new ParamsMissedException();
    }
    return value;
  }
}
