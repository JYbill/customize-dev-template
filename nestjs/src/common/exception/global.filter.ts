import { ResponseUtil } from "../util/response.util";
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Request, Response } from "express";

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
      this.logger.error(exception.stack || exception);
      if (exception instanceof NotFoundException) {
        response.status(404).json(ResponseUtil.error("接口未找到"));
      } else if (exception instanceof BadRequestException) {
        this.logger.warn(`request error: ${exception.message}`);
        this.logger.warn(exception.getResponse());
        const status = exception.getStatus();
        if (exception.getResponse()["message"] instanceof Array) {
          // 错误描述数组
          const [errorMessage] = exception.getResponse()["message"] || "请求格式错误";
          response.status(status).json(ResponseUtil.error(errorMessage));
        } else {
          // 错误描述字符串
          const errorMessage = exception.getResponse()["message"] || "请求格式错误";
          response.status(status).json(ResponseUtil.error(errorMessage));
        }
      } else {
        response.status(500).json(ResponseUtil.error(undefined));
      }
    } catch (err: unknown) {
      const error = err as Error;
      // 代码错误
      this.logger.error(error);
      response.status(500).json(ResponseUtil.error("拦截代码存在边界情况"));
    }
  }
}
