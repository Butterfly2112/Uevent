import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeResponse {
  @ApiProperty({
    description: 'Unique identifier of the promo code',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Id of the event this promo code belongs to',
    example: 5,
  })
  event_id: number;

  @ApiProperty({ description: 'Promo code string', example: 'SAVE20' })
  code: string;

  @ApiProperty({
    description: 'Discount percentage applied when using this code',
    example: 20,
  })
  discount_percentage: number;

  @ApiProperty({ description: 'Date when the promo code expires' })
  expires_at: Date;
}
