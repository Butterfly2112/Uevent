import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description:
      'Login of the user. Can only contain numbers, letters and characters _ and -. Cannot be changed later.',
    example: 'newUser_2026',
    uniqueItems: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Login can only contain numbers, letters and characters _ and -',
  })
  login: string;

  @ApiProperty({
    description: 'Name of the user. Can be changed later.',
    example: 'Sleeping Beauty',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, {
    message: 'Length of username cannot have more then 50 characters',
  })
  username: string;

  @ApiProperty({
    description: 'User email.',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

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
  password: string;
}
