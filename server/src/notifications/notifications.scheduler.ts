import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventService } from '../events/events.service';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';
import { NotificationType } from './types/notifications-type.enum';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class NotificationsScheduler {
  constructor(
    private eventService: EventService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private ticketsService: TicketsService,
  ) {}

  // Кожну годину
  @Cron('0 * * * *')
  async sendEventReminders() {
    const now = new Date();

    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const events = await this.eventService.getEventsForReminder(
      tomorrowStart,
      tomorrowEnd,
    );

    for (const event of events) {
      const users = await this.getEventParticipants(event.id);

      await Promise.all(
        users.map((user) =>
          this.notificationsService.createNotification({
            user,
            type: NotificationType.EVENT_REMINDER,
            event,
          }),
        ),
      );

      await this.eventService.markReminderSent(event.id);
    }
  }

  private async getEventParticipants(eventId: number) {
    return this.ticketsService.getEventParticipants(eventId);
  }
}