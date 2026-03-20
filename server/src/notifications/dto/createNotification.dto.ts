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
    description: 'Jeffrey Epstein',
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: Object.values(NotificationType), example: 'new_event' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'New entrance', description: 'Party on the island' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Take Stephen Hawking with you.',
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