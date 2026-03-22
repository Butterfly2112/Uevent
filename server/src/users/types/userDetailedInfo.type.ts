import { SafeCompanyResponse } from 'src/companies/types/safeCompanyResponse.type';
import { EventResponse } from 'src/events/types/eventResponse.type';
import { NotificationResponse } from 'src/notifications/types/notificationsResponse.type';
import { TicketResponse } from 'src/tickets/types/ticketResponse.type';
import { UserResponse } from './userResponse.type';
import { ApiProperty } from '@nestjs/swagger';

export class UserDetailedInfo {
  @ApiProperty({ description: 'Unique identifier of the user', example: 1 })
  id: number;

  @ApiProperty({ description: 'Unique login of the user', example: 'mosquito' })
  login: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'Edward Cullen',
  })
  username: string;

  @ApiProperty({
    description: 'Email address (owner/admin only)',
    example: 'mosquito@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({ description: 'URL of the user avatar', required: false })
  avatar_url: string;

  @ApiProperty({
    description: 'Role of the user (owner/admin only)',
    enum: ['user', 'admin'],
    required: false,
  })
  role?: 'user' | 'admin';

  @ApiProperty({
    description: 'Whether email is verified (owner/admin only)',
    example: true,
    required: false,
  })
  is_email_verified?: boolean;

  @ApiProperty({
    description: 'Date when the account was created (owner/admin only)',
    required: false,
  })
  created_at?: Date;

  @ApiProperty({
    description: 'Events hosted by this user',
    type: () => [EventResponse],
  })
  hosted_events: EventResponse[];

  @ApiProperty({
    description: 'Tickets purchased by this user (owner/admin only)',
    type: () => [TicketResponse],
    required: false,
  })
  tickets?: TicketResponse[];

  @ApiProperty({
    description: 'Company owned by this user, if any',
    type: () => SafeCompanyResponse,
    required: false,
  })
  company?: SafeCompanyResponse;

  @ApiProperty({
    description: 'Notifications of this user (owner/admin only)',
    required: false,
  })
  notifications?: NotificationResponse[];

  @ApiProperty({
    description: 'Users this user is following (owner/admin only)',
    type: () => [UserResponse],
    required: false,
  })
  following?: UserResponse[];

  @ApiProperty({
    description: 'Users following this user (owner/admin only)',
    type: () => [UserResponse],
    required: false,
  })
  followers?: UserResponse[];
}
