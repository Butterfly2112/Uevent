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

    const exactly24HoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const events = await this.eventService.getEventsForReminder(
      now,
      exactly24HoursFromNow,
    );

    for (const event of events) {
      const users = await this.getEventParticipants(event.id);

      if (users.length > 0) {
        await Promise.all(
          users.map((user) =>
            this.notificationsService.createNotification({
              user,
              type: NotificationType.EVENT_REMINDER,
              event,
            }),
          ),
        );
      }

      await this.eventService.markReminderSent(event.id);
    }
  }

  private async getEventParticipants(eventId: number) {
    return this.ticketsService.getParticipantsForSystem(eventId);
  }
}