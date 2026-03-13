import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Login or Email of the user.',
    examples: ['newUser_2026', 'user@example.com'],
  })
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongPassword_123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
