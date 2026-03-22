import { UserResponse } from 'src/users/types/userResponse.type';
import { EventFormat, EventStatus, EventTheme } from '../entities/event.entity';
import { TicketResponse } from 'src/tickets/types/ticketResponse.type';
import { CommentResponse } from 'src/comments/types/commentResponse.type';
import { PromoCodeResponse } from './promo-codeResponse.type';
import { ApiProperty } from '@nestjs/swagger';
import { SafeCompanyResponse } from 'src/companies/types/safeCompanyResponse.type';

export class EventResponse {
  @ApiProperty({ description: 'Unique identifier of the event', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Company under which this event was created',
    required: false,
  })
  company?: SafeCompanyResponse;

  @ApiProperty({ description: 'Host of this event', required: false })
  host?: UserResponse;

  @ApiProperty({
    description: 'Whether owner wants to receive notifications',
    required: false,
  })
  notificate_owner?: boolean;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Leon fanbase gathering',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'Gathering of the Leon Kennedy Fanbase.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Price for one ticket',
    example: 100,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Maximum number of tickets available',
    example: 2000,
    required: false,
  })
  ticket_limit?: number;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Raccoon City',
    required: false,
  })
  address?: string;

  @ApiProperty({ description: 'URL of the event poster', required: false })
  poster_url?: string;

  @ApiProperty({
    description: 'Page to redirect user after buying a ticket',
    required: false,
  })
  redirect_url?: string;

  @ApiProperty({ description: 'Date when the event starts', required: false })
  start_date?: Date;

  @ApiProperty({ description: 'Date when the event ends', required: false })
  end_date?: Date;

  @ApiProperty({
    description: 'Date when the event becomes visible to public',
    required: false,
  })
  publish_date?: Date;

  @ApiProperty({
    description: 'Current status of the event',
    enum: EventStatus,
    required: false,
  })
  status?: EventStatus;

  @ApiProperty({
    description: 'Format of the event',
    enum: EventFormat,
    required: false,
  })
  format?: EventFormat;

  @ApiProperty({
    description: 'Theme of the event',
    enum: EventTheme,
    required: false,
  })
  theme?: EventTheme;

  @ApiProperty({
    description:
      'Who can see the list of attendees — everybody or only those who bought a ticket',
    enum: ['everybody', 'attendees_only'],
    required: false,
  })
  visitor_visibility?: 'everybody' | 'attendees_only';

  @ApiProperty({
    description: 'List of attendees (visibility depends on visitor_visibility)',
    required: false,
  })
  tickets?: Partial<TicketResponse>[];

  @ApiProperty({ description: 'Comments left on this event', required: false })
  comments?: CommentResponse;

  @ApiProperty({
    description: 'Promo codes for this event (owner/admin only)',
    required: false,
  })
  promo_codes?: PromoCodeResponse[];
}
