import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
} from './entities/notifications.entity';
import { NotificationType, EmailStatus } from './types/notifications-type.enum';
import { User } from 'src/users/entities/user.entity';
import { NotificationResponse } from './types/notificationsResponse.type';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  // Створення сповіщення
  async createNotification(data: {
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    send_email?: boolean;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user: data.user,
      type: data.type,
      title: data.title,
      message: data.message,
      send_email: data.send_email ?? false,
      email_status: data.send_email ? EmailStatus.PENDING : null,
    });

    const saved = await this.notificationRepo.save(notification);

    // Надсилання листа на email
    if (saved.send_email) {
      this.sendEmail(saved).catch(console.error);
    }

    return saved;
  }

  // Відправка листа
  private async sendEmail(notification: Notification) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.HOST_FOR_EMAIL,
        port: Number(process.env.PORT_FOR_EMAIL),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Надсилаємо лист
      await transporter.sendMail({
        from: `"MyApp" <${process.env.SMTP_USER}>`,
        to: notification.user.email,
        subject: notification.title,
        text: notification.message,
      });
      notification.email_status = EmailStatus.SENT;
    } catch (err) {
      notification.email_status = EmailStatus.FAILED;
      console.error('Failed to send email:', err);
    } finally {
      notification.sent_at = new Date();
      notification.attempts += 1;
      await this.notificationRepo.save(notification);
    }
  }

  // Отримати всі сповіщення користувача
  async getUserNotifications(userId: number): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return notifications.map((n) => this.toResponse(n));
  }

  // Отримати одне сповіщення
  async getNotification(
    notificationId: number,
  ): Promise<NotificationResponse | null> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    return notification ? this.toResponse(notification) : null;
  }

  // Позначити як прочитане
  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepo.update(notificationId, { is_read: true });
  }

  // Видалити сповіщення
  async deleteNotification(notificationId: number): Promise<void> {
    await this.notificationRepo.delete(notificationId);
  }

  private toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read,
      send_email: notification.send_email,
      email_status: notification.email_status ?? null,
      attempts: notification.attempts,
      sent_at: notification.sent_at ?? null,
      created_at: notification.created_at,
    };
  }
}
