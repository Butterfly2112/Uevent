import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { NotificationType, EmailStatus } from './types/notifications-type.enum';
import { User } from 'src/users/entities/user.entity';
import { NotificationResponse } from './types/notificationsResponse.type';
import { EmailService } from 'src/email/email.service';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private emailService: EmailService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Створення сповіщення
  async createNotification(data: {
    user: User;
    event?: Event;
    type: NotificationType;
    title: string;
    message: string;
    send_email?: boolean;
  }): Promise<Notification> {
    const user = await this.userRepo.findOne({
      where: { id: data.user.id },
    });

    if (!user) throw new Error('User not found');

    const notification = this.notificationRepo.create({
      user,
      type: data.type,
      title: data.title,
      message: data.message,
      send_email: data.send_email ?? false,
      email_status: data.send_email ? EmailStatus.PENDING : null,
    });

    const saved = await this.notificationRepo.save(notification);

    if (saved.send_email) {
      if (data.event) {
        await this.emailService.sendReminder(
          saved.user.login,
          saved.user.email,
          saved.title,
          data.event.start_date,
        );
        saved.email_status = EmailStatus.SENT;
      } else {
        await this.emailService.sendReminder(
          saved.user.login,
          saved.user.email,
          saved.title,
          new Date(),
        );
        saved.email_status = EmailStatus.SENT;
      }

      saved.sent_at = new Date();
      saved.attempts += 1;
      await this.notificationRepo.save(saved);
    }

    return saved;
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