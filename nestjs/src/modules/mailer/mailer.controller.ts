import { Controller, Get } from "@nestjs/common";
import { SendService } from "@/modules/mailer/mailer.service";

@Controller("mailer")
export class MailerController {
  constructor(private readonly sendService: SendService) {}
  @Get("/")
  async test() {
    await this.sendService.sendMagicLink("jybill752299324@gmail.com");
    return "ok";
  }
}
