import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { NotificationResponse } from './types/notificationsResponse.type';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { NotificationType } from './types/notifications-type.enum';
import { Event } from 'src/events/entities/event.entity';
import { EventService } from '../events/events.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly eventService: EventService,
  ) {}

  // Отримати всі сповіщення користувача
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiParam({ name: 'userId', example: 1 })
  getAll(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<NotificationResponse[]> {
    return this.notificationsService.getUserNotifications(userId);
  }

  // Отримати одне сповіщення
  @Get(':id')
  @ApiOperation({ summary: 'Receive one notification' })
  @ApiParam({ name: 'id', example: 1 })
  getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponse | null> {
    return this.notificationsService.getNotification(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiBody({ type: CreateNotificationDto })
  async create(@Body() body: CreateNotificationDto) {
    const user = await this.usersService.getUserById(body.userId);

    let event: Event | undefined = undefined;

    const typesRequiringEvent = [
      NotificationType.EVENT_REMINDER,
      NotificationType.EVENT_COMMENT,
    ];

    if (typesRequiringEvent.includes(body.type)) {
      if (!body.eventId) {
        throw new BadRequestException(
          `Event ID is required for notification type ${body.type}`,
        );
      }
      event = await this.eventService.getEventById(body.eventId);
    }

    return this.notificationsService.createNotification({
      user,
      type: body.type,
      event,
    });
  }

  // Позначити як прочитане
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  @ApiParam({ name: 'id', example: 1 })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.markAsRead(id);
    return { message: 'Notification marked as read' };
  }

  // Видалити
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', example: 1 })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.deleteNotification(id);
    return { message: 'Notification deleted' };
  }
}