import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('SMTP_SERVICE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmailConfirmation(
    username: string,
    email: string,
    token: string,
  ): Promise<void> {
    const host = this.configService.get('HOST_FOR_EMAIL');
    const url = host.startsWith('http')
      ? `${host}/confirm-email?token=${token}`
      : `http://${host}/confirm-email?token=${token}`;
    const info = await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Confirm your email',
      text: `To confirm your registration follow the link: ${url}`,
      html: `
      <h1>Dear ${username}</h1>
      <h1>Welcome to the Uevent</h1>
      <p>Please, confirm your registration by following link below</p>
      <a href="${url}">Confirm Email</a>`,
    });

    console.log('Message send: ', info.messageId);
  }

  async sendReminder(
    username: string,
    email: string,
    eventTitle: string,
    eventDate: Date,
  ): Promise<void> {
    const formattedDate = eventDate.toLocaleString();

    const info = await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: `Reminder: ${eventTitle} is coming soon`,
      text: `Hi ${username},\n\nReminder that "${eventTitle}" will take place on ${formattedDate}.`,
      html: `
      <h2>Hello, ${username}</h2>
      <p>This is a reminder that your event is coming soon:</p>
      <h3>${eventTitle}</h3>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p>Don't miss it</p>
    `,
    });

    console.log('Reminder email sent: ', info.messageId);
  }
}