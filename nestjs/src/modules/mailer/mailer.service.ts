import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class SendService {
  constructor(private readonly mailer: MailerService) {}

  async sendMagicLink(to: string, subject = "Login Magic Link") {
    const result = await this.mailer.sendMail({
      to,
      subject,
      html: "<b>hello, your code is ...</b>",
    });
    console.log(result);
  }
}
