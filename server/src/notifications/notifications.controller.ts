import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { NotificationResponse } from './types/notificationsResponse.type';
import { CreateNotificationDto } from './dto/createNotification.dto';

import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
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

  // Створити сповіщення (тимчасово)
  @Post()
  @ApiOperation({ summary: 'Create an notification' })
  @ApiBody({ type: CreateNotificationDto })
  create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.createNotification({
      user: { id: body.userId } as any,
      type: body.type,
      title: body.title.trim(),
      message: body.message.trim(),
      send_email: body.send_email ?? false,
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