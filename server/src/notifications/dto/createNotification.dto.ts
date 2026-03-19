import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import {
  NotificationType,
  EmailStatus,
} from '../types/notifications-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    example: 1,
    description: 'User ID to which the notification belongs',
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: Object.values(NotificationType), example: 'event_news' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'New entrance', description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'You are logged in from a new device.',
    description: 'Message text',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  send_email?: boolean;

  @ApiPropertyOptional({ enum: Object.values(EmailStatus), nullable: true })
  @IsEnum(EmailStatus)
  @IsOptional()
  email_status?: EmailStatus;
}