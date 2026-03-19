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

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Отримати всі сповіщення
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiResponse({ status: 200, description: 'Notification list' })
  getAll(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<NotificationResponse[]> {
    return this.notificationsService.getUserNotifications(userId);
  }

  // Отримати одне
  @Get(':id')
  @ApiOperation({ summary: 'Receive one notification' })
  @ApiParam({ name: 'id', example: 1 })
  getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponse | null> {
    return this.notificationsService.getNotification(id);
  }

  // Створити
  @Post()
  @ApiOperation({ summary: 'Create notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.createNotification({
      user: { id: body.userId } as any, // тимчасово
      type: body.type,
      title: body.title,
      message: body.message,
      send_email: body.send_email,
    });
  }

  // Прочитано
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark as read' })
  @ApiParam({ name: 'id', example: 1 })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  // Видалити
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', example: 1 })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.deleteNotification(id);
  }
}