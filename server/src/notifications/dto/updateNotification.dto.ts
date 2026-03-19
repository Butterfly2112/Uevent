import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './createNotification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Is the notification read?',
  })
  @IsBoolean()
  @IsOptional()
  is_read?: boolean;
}