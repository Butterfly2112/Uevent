import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationResponse } from './types/notificationsResponse.type';
import { User } from 'src/users/entities/user.entity';
import { NotificationType } from './types/notificationsType.type';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Отримати всі сповіщення користувача
  @Get('user/:userId')
  getAll(@Param('userId') userId: number): Promise<NotificationResponse[]> {
    return this.notificationsService.getUserNotifications(userId);
  }

  // Отримати одне сповіщення
  @Get(':id')
  getOne(@Param('id') id: number): Promise<NotificationResponse | null> {
    return this.notificationsService.getNotification(id);
  }

  // Створити сповіщення
  @Post()
  create(
    @Body()
    body: {
      user: User;
      type: NotificationType;
      title: string;
      message: string;
      send_email?: boolean;
    },
  ) {
    return this.notificationsService.createNotification(body);
  }

  // Позначити як прочитане
  @Patch(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsRead(id);
  }

  // Видалити
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.notificationsService.deleteNotification(id);
  }
}
