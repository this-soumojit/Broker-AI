import fs from "fs";
import path from "path";

import ejs from "ejs";
import nodemailer from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";

import env from "../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.SMTP.HOST as string,
  port: parseInt(env.SMTP.PORT as string, 10),
  secure: env.SMTP.SECURE === "true",
  auth: {
    user: env.SMTP.USER as string,
    pass: env.SMTP.PASSWORD as string,
  },
});

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, string>;
  attachments: Attachment[] | undefined;
}

async function sendEmail(options: SendEmailOptions) {
  const templatePath = path.join(__dirname, "..", "views", `${options.template}.ejs`);
  const template = fs.readFileSync(templatePath, "utf8");
  const html = ejs.render(template, options.context);

  const info = await transporter.sendMail({
    from: `"${env.SMTP.FROM_NAME}" <${env.SMTP.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html,
    attachments: options.attachments,
  });

  logger.info("Message sent: %s", info.messageId);
}

export { sendEmail };
