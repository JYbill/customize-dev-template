import { Injectable, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { Role } from '../enum/app.enum';
import { AuthDenied } from '../exception/global.expectation';

/**
 * @Description: 无
 * @Author: 小钦var
 * @Date: 2024/4/17 10:59
 */
@Injectable()
export default class AdminMiddleware {
  private readonly logger: Logger = new Logger(AdminMiddleware.name);

  constructor(private readonly prismaService: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = await this.prismaService.$GlobalExt.user.findUnique({
      where: { id: req.user.id, role: { key: Role.ADMIN } },
    });
    if (!user) {
      throw new AuthDenied();
    }
    next();
  }
}
