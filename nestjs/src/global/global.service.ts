import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalService {
  private readonly logger: Logger = new Logger(GlobalService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}
}
