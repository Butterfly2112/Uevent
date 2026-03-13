import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'newUser_2026' })
  login: string;

  @ApiProperty({ example: 'Sleeping Beauty' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: true })
  emailValidated: boolean;

  @ApiProperty({ example: 'avatars/example.jpg' })
  avatar_url: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  created_at: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Logged in successfully' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
  access_token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
