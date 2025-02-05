import { Module } from "@nestjs/common";
import { SendService } from "./mailer.service";
import { MailerController } from "./mailer.controller";

@Module({
  controllers: [MailerController],
  providers: [SendService],
  exports: [SendService],
})
export class MailerUtilModule {}
