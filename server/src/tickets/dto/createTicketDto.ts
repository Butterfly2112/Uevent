import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    example: 1,
    description: 'user ID',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 10,
    description: 'event ID',
  })
  @IsInt()
  eventId: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'promocode ID(optional)',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsBoolean()
  @IsOptional()
  user_is_visible_to_public?: boolean;
}
