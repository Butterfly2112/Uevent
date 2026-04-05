import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { NotificationType, EmailStatus } from './types/notifications-type.enum';
import { User } from 'src/users/entities/user.entity';
import { NotificationResponse } from './types/notificationsResponse.type';
import { EmailService } from 'src/email/email.service';
import { Event } from 'src/events/entities/event.entity';
import { Company } from 'src/companies/entities/company.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private emailService: EmailService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private notificationConfig = {
    [NotificationType.EVENT_NEWS]: { email: false },
    [NotificationType.NEW_EVENT]: { email: false },
    [NotificationType.COMPANY_NEWS]: { email: false },
    [NotificationType.EVENT_NEW_PARTICIPANT]: { email: false },
    [NotificationType.EVENT_COMMENT]: { email: false },
    [NotificationType.COMMENT_REPLY]: { email: false },

    [NotificationType.TICKET_PURCHASE]: { email: true },
    [NotificationType.EVENT_REMINDER]: { email: true },
    [NotificationType.PAYMENT_SUCCESS]: { email: true },
    [NotificationType.REFUND_SUCCESS]: { email: true },

    [NotificationType.EVENT_CANCELED]: { email: false },
  };

  // Створити сповіщення
  async createNotification(data: {
    user: User;
    type: NotificationType;
    event?: Event;
    companyName?: string;
    ticket?: any;
    userName?: string;
  }): Promise<Notification> {
    const content = this.buildNotificationContent(data);

    const sendEmail = this.notificationConfig[data.type].email;

    const notification = this.notificationRepo.create({
      user: data.user,
      type: data.type,
      title: content.title,
      message: content.message,
      send_email: sendEmail,
      email_status: sendEmail ? EmailStatus.PENDING : null,
    });

    const saved = await this.notificationRepo.save(notification);

    if (sendEmail) {
      await this.handleEmail(saved, data.event, data.ticket);
    }

    return saved;
  }

  private buildNotificationContent(data: {
    type: NotificationType;
    event?: Event;
    userName?: string;
    companyName?: string;
  }) {
    switch (data.type) {
      case NotificationType.TICKET_PURCHASE:
        return {
          title: 'Ticket purchased',
          message: 'You have successfully purchased a ticket',
        };

      case NotificationType.EVENT_REMINDER:
        return {
          title: 'Event reminder',
          message: `Event "${data.event?.title}" is coming soon`,
        };

      case NotificationType.PAYMENT_SUCCESS:
        return {
          title: 'Payment successful',
          message: `Your payment for "${data.event?.title}" was successful`,
        };

      case NotificationType.EVENT_COMMENT:
        return {
          title: 'New comment',
          message: `${data.userName || 'Someone'} commented on your event "${data.event?.title}"`,
        };

      case NotificationType.COMMENT_REPLY:
        return {
          title: 'Reply to your comment',
          message: `${data.userName || 'Someone'} replied to your comment on "${data.event?.title}"`,
        };

      case NotificationType.REFUND_SUCCESS:
        return {
          title: 'Refund successful',
          message: 'Your ticket money has been refunded',
        };

      case NotificationType.EVENT_NEWS:
        return {
          title: 'Event update',
          message: `There is an update for "${data.event?.title}"`,
        };

      case NotificationType.NEW_EVENT:
        return {
          title: 'New event',
          message: `A new event "${data.event?.title}" has been created`,
        };

      case NotificationType.COMPANY_NEWS:
        return {
          title: 'Company update',
          message: `New update from ${data.companyName}`,
        };

      case NotificationType.EVENT_NEW_PARTICIPANT:
        return {
          title: 'New participant',
          message: `${data.userName} joined your event "${data.event?.title}"`,
        };

      case NotificationType.EVENT_CANCELED:
        return {
          title: 'Canceled event',
          message: `An event "${data.event?.title}" has been canceled`,
        };

      default:
        return {
          title: 'Notification',
          message: 'You have a new notification',
        };
    }
  }

  private async handleEmail(
    notification: Notification,
    event?: Event,
    ticket?: any,
  ) {
    try {
      const type = notification.type as
        | NotificationType.TICKET_PURCHASE
        | NotificationType.EVENT_REMINDER
        | NotificationType.PAYMENT_SUCCESS
        | NotificationType.REFUND_SUCCESS;

      switch (type) {
        case NotificationType.EVENT_REMINDER:
          await this.emailService.sendReminder(
            notification.user.login,
            notification.user.email,
            event?.title || 'Your Event',
            event?.start_date,
          );
          break;

        case NotificationType.TICKET_PURCHASE:
          if (!ticket) throw new Error('Ticket is required');

          await this.emailService.sendTicketPurchase(
            notification.user.login,
            notification.user.email,
            ticket,
          );
          break;

        case NotificationType.PAYMENT_SUCCESS:
          if (!ticket) throw new Error('Ticket is required');

          await this.emailService.sendPaymentSuccess(
            notification.user.login,
            notification.user.email,
            {
              id: ticket.id,
              eventTitle: ticket.eventTitle,
              eventDate: ticket.eventDate,
              pricePaid: ticket.price,
            },
          );
          break;

        case NotificationType.REFUND_SUCCESS:
          if (!ticket) throw new Error('Ticket is required');

          await this.emailService.sendRefundSuccess(
            notification.user.login,
            notification.user.email,
            {
              id: ticket.id,
              eventTitle: ticket.eventTitle,
              eventDate: ticket.eventDate,
              refundAmount: ticket.price,
            },
          );
          break;
      }

      notification.email_status = EmailStatus.SENT;
    } catch (err) {
      notification.email_status = EmailStatus.FAILED;
      console.error(err);
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
      order: { created_at: 'DESC' } as const,
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
    await this.notificationRepo.update(notificationId, {
      is_read: true,
    } as any);
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
