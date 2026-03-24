import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { NotificationType } from '../types/notifications-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    enum: Object.values(NotificationType),
    example: 'event_reminder',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    example: 10,
    description: 'Event ID (optional)',
  })
  @IsInt()
  @IsOptional()
  eventId?: number;
}