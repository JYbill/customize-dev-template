/**
 * @Description: nodemailer入口
 * @Date: 2024/9/14 15:30
 */
import nodemailer from "nodemailer";

import { config } from "#config";

const mailerConfig = config.mailer;
export const globalMailer = nodemailer.createTransport({
  host: mailerConfig.host,
  port: mailerConfig.port,
  requireTLS: true, // 启用TLS
  auth: {
    user: mailerConfig.user,
    pass: mailerConfig.code,
  },
});
