import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class requestPasswordResetDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'crazy@example.com',
  })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
}

export class resetPasswordDto {
  @ApiProperty({
    description:
      'Password of the user. Must contain at least one uppercase letter, one lowercase letter and one number.',
    example: 'StrongPassword_123',
  })
  @IsString()
  @MinLength(8, {
    message:
      'For the sake of safety, password should be at least 8 characters long',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  newPassword: string;
}
