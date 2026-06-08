import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendStatusChangeEmail(
    to: string,
    applicantName: string,
    jobTitle: string,
    status: string,
  ): Promise<void> {
    const from = this.configService.get<string>('mail.from');
    const subject = `Application update: ${jobTitle}`;
    const html = `
      <p>Hi ${applicantName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated to <strong>${status.replace(/_/g, ' ')}</strong>.</p>
      <p>Log in to your dashboard to view details.</p>
    `;

    try {
      await this.transporter.sendMail({ from, to, subject, html });
    } catch (error) {
      this.logger.warn(`Failed to send email to ${to}: ${error}`);
    }
  }
}
