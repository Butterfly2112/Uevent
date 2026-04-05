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
    const port = this.configService.get('PORT_FOR_EMAIL');
    const url = host.startsWith('http')
      ? `${host}/confirm-email?token=${token}`
      : `http://${host}:${port}/confirm-email?token=${token}`;
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

  async sendWelcomeMessageGoogle(
    username: string,
    email: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Thanks for choosing Uevent',
      html: `
      <h1>Dear ${username}</h1>
      <h1>Welcome to the Uevent</h1>
      <p>You successfully registered using your Google account</p>`,
    });

    console.log('Message send: ', info.messageId);
  }

  async sendResetEmailConfirmation(
    username: string,
    email: string,
    token: string,
  ): Promise<void> {
    const host = this.configService.get('HOST_FOR_EMAIL');
    const port = this.configService.get('PORT_FOR_EMAIL');
    const url = host.startsWith('http')
      ? `${host}/confirm-email?token=${token}`
      : `http://${host}:${port}/confirm-email?token=${token}`;
    const info = await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Confirm your email',
      text: `To confirm your registration follow the link: ${url}`,
      html: `
      <h1>Dear ${username}</h1>
      <h1>Your email is being reset</h1>
      <p>Please, confirm new email by following link below</p>
      <a href="${url}">Confirm Email</a>`,
    });

    console.log('Message send: ', info.messageId);
  }

  async sendReminder(
    username: string,
    email: string,
    eventTitle: string,
    eventDate?: Date,
  ): Promise<void> {
    const dateToUse = eventDate ?? new Date();
    const formattedDate = dateToUse.toLocaleString();

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
      <p>Don't miss it!</p>
    `,
    });

    console.log('Reminder email sent: ', info.messageId);
  }

  async sendTicketPurchase(
    username: string,
    email: string,
    ticket: {
      id: number;
      eventTitle: string;
      eventDate: Date;
      price: number;
      promoCode?: string;
    },
  ) {
    await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Ticket Purchased Successfully',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${username}</h2>
        <p>Your ticket has been successfully purchased.</p>

        <hr />

        <h3>Ticket Details</h3>
        <ul>
          <li><b>Ticket ID:</b> ${ticket.id}</li>
          <li><b>Event:</b> ${ticket.eventTitle}</li>
          <li><b>Date:</b> ${new Date(ticket.eventDate).toLocaleString()}</li>
          <li><b>Price:</b> $${ticket.price}</li>
          ${
            ticket.promoCode
              ? `<li><b>Promo Code:</b> ${ticket.promoCode}</li>`
              : ''
          }
        </ul>

        <p style="margin-top:20px;">
          Thank you for using <b>Uevent</b>
        </p>
      </div>
    `,
    });
  }

  async sendPaymentSuccess(
    username: string,
    email: string,
    ticket: {
      id: number;
      eventTitle: string;
      eventDate: Date;
      pricePaid: number;
    },
  ) {
    await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Payment Successful',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Payment Successful</h2>
        <p>Hello ${username}, your payment has been confirmed.</p>

        <hr />

        <h3>Ticket Info</h3>
        <ul>
          <li><b>Ticket ID:</b> ${ticket.id}</li>
          <li><b>Event:</b> ${ticket.eventTitle}</li>
          <li><b>Date:</b> ${new Date(ticket.eventDate).toLocaleString()}</li>
          <li><b>Amount Paid:</b> $${ticket.pricePaid}</li>
        </ul>

        <p style="margin-top:20px;">
          Enjoy your event!
        </p>
      </div>
    `,
    });
  }

  async sendRefundSuccess(
    username: string,
    email: string,
    ticket: {
      id: number;
      eventTitle: string;
      eventDate: Date;
      refundAmount: number;
    },
  ) {
    await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Refund Successful',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Refund Successful</h2>
        <p>Hello ${username}, your refund has been processed.</p>

        <hr />

        <h3>Refund Details</h3>
        <ul>
          <li><b>Ticket ID:</b> ${ticket.id}</li>
          <li><b>Event:</b> ${ticket.eventTitle}</li>
          <li><b>Date:</b> ${new Date(ticket.eventDate).toLocaleString()}</li>
          <li><b>Refund Amount:</b> $${ticket.refundAmount}</li>
        </ul>

        <p style="margin-top:20px;">
          The amount will be returned according to your payment provider rules.
        </p>
      </div>
    `,
    });
  }

  async sendPasswordRequest(username: string, token: string, email: string) {
    const host = this.configService.get('HOST_FOR_EMAIL');
    const port = this.configService.get('PORT_FOR_EMAIL');
    const url = host.startsWith('http')
      ? `${host}/password_reset?token=${token}`
      : `http://${host}:${port}/password-reset?token=${token}`;
    await this.transporter.sendMail({
      from: `"Uevent" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Attention! Do not show this message to anybody!',
      html: `<h2>Hello ${username}</h2>
      <p>To continue password reset please follow the link below.</p>
      <h2><a href="${url}">Reset Password</a></h2>
      <p>If you wasn't requesting for password reset - ignore this message</p>`,
    });
  }
}
