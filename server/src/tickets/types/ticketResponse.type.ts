import { ApiProperty } from '@nestjs/swagger';
import { PromoCodeResponse } from 'src/events/types/promo-codeResponse.type';
import { UserResponse } from 'src/users/types/userResponse.type';
import { TicketStatus } from '../entities/ticket.entity';

export class TicketResponse {
  @ApiProperty({ description: 'Unique identifier of the ticket', example: 1 })
  id: number;

  @ApiProperty({ description: 'Event this ticket belongs to' })
  event: {
    id: number;
    company_id?: number;
    title: string;
    price: number;
  };

  @ApiProperty({ description: 'User who owns this ticket' })
  user: UserResponse;

  @ApiProperty({
    description: 'Whether this user is visible to other attendees',
    example: true,
  })
  user_is_visible_to_public: boolean;

  @ApiProperty({
    description: 'Promo code applied to this ticket, if any',
    required: false,
  })
  promo_code?: PromoCodeResponse;

  @ApiProperty({ description: 'Final price paid for this ticket', example: 80 })
  price_paid: number;

  @ApiProperty({
    description: 'Current status of the ticket',
    enum: TicketStatus,
  })
  status: TicketStatus;
}
