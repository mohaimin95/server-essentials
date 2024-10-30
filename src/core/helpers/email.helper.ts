import nodemailer, { Transporter } from 'nodemailer';
import {
  MailOptions,
  SentMessageInfo,
} from 'nodemailer/lib/smtp-transport';

export default class EmailHelper {
  private transporter: Transporter;

  constructor() {
    // Set up the transport options (replace with your SMTP provider)
    this.transporter = nodemailer.createTransport({
      host: String(process.env.SMTP_HOST),
      port: Number(process.env.SMTP_PORT),
      secure: Boolean(+String(process.env.SMTP_SECURE || 1)),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private static validateEmail(email: string): boolean {
    // eslint-disable-next-line no-useless-escape
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }

  private static validateEmails(emails: string[]): boolean {
    return emails.every((email) => EmailHelper.validateEmail(email));
  }

  public async sendEmail({
    from,
    to,
    subject,
    html,
    attachments = [],
  }: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    attachments?: { filename: string; path: string }[];
  }): Promise<SentMessageInfo> {
    // Validate 'from' and 'to' emails
    if (!EmailHelper.validateEmail(from)) {
      throw new Error('Invalid "from" email address');
    }
    if (!EmailHelper.validateEmails(to)) {
      throw new Error('Invalid "to" email address');
    }

    // Construct mail options
    const mailOptions: MailOptions = {
      from,
      to: to.join(', '),
      subject,
      html,
      attachments,
    };

    // Send the email
    return this.transporter.sendMail(mailOptions);
  }
}
