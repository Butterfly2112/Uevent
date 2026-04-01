import { ApiProperty } from '@nestjs/swagger';

export class UserForAdminResponse {
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
  email: string;

  @ApiProperty({
    description: 'Whether email is verified (owner/admin only)',
    example: true,
    required: false,
  })
  is_email_verified: boolean;

  @ApiProperty({
    description: 'Role of the user (owner/admin only)',
    enum: ['user', 'admin'],
    required: false,
  })
  role: 'user' | 'admin';

  @ApiProperty({ description: 'URL of the user avatar', required: false })
  avatar_url: string;

  @ApiProperty({
    description: 'Date when the account was created (owner/admin only)',
    required: false,
  })
  created_at: Date;
}

export class UsersForAdminResponse {
  @ApiProperty({
    description: 'All users that matched search options',
    type: [UserForAdminResponse],
  })
  users: UserForAdminResponse[] | [];

  @ApiProperty({
    description: 'Total number of users found',
    example: 1,
  })
  total: number;
}
