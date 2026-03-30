import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Sleeping Beauty',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, {
    message: 'Length of username cannot have more then 50 characters',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'User email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'URL of the user avatar', required: false })
  @IsOptional()
  avatar_url?: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: ['user', 'admin'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';
}

export class UpdateUserDtoD extends OmitType(UpdateUserDto, [
  'avatar_url' as const,
]) {
  @ApiProperty({ description: 'URL of the user avatar', required: false })
  @IsOptional()
  file?: string;
}
