import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from 'src/tickets/entities/ticket.entity';
import { UserResponse } from 'src/users/types/userResponse.type';

export class EventAttendeeResponse {
  @ApiProperty({ description: 'Ticket id' })
  id: number;

  @ApiProperty({ description: 'Attendee info' })
  user: UserResponse;

  @ApiProperty({ description: 'Ticket status', enum: TicketStatus })
  status: TicketStatus;
}
