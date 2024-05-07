import { ResponseUtil } from '../util/response.util';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * @Description: 全局异常处理器
 * @Author: 小钦var
 * @Date: 2024年05月07日 10:07:48
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    request.pass = false;

    try {
      // 正常业务代码抛出的异常
      if (exception instanceof NotFoundException) {
        this.logger.warn(exception.message);
        const status = exception.getStatus();
        response.status(status).json(ResponseUtil.error('接口未找到', status));
      } else if (exception instanceof BadRequestException) {
        this.logger.warn(`request error: ${exception.message}`);
        const status = exception.getStatus();
        response
          .status(status)
          .json(ResponseUtil.error('请求格式错误', status));
      } else {
        this.logger.error(exception.stack);
        const status = exception.getStatus();
        response.status(status).json(ResponseUtil.error(undefined, status));
      }
    } catch (err: unknown) {
      const error = err as Error;
      // 代码错误
      this.logger.error(error);
      response.status(500).json(ResponseUtil.error(undefined, 500));
    }
  }
}
