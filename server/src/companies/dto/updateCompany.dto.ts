import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Name of the company',
    example: 'Doofenshmirtz Evil Incorporated',
  })
  @MinLength(3, {
    message: 'Name of the company need to be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Name of the company needs to be shorter than 50 characters',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email for reaching company',
    example: 'corporation@example.com',
  })
  @IsOptional()
  @IsEmail()
  email_for_info?: string;

  @ApiProperty({
    description: 'Location of the company',
    example: '13, Willow Street',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'About company',
    example: 'Evil corporation for -enators',
  })
  @MaxLength(500, {
    message: 'Description cannot be longer than 500 characters',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Picture of the company profile' })
  @IsOptional()
  picture_url?: string;
}

export class UpdateCompanyDtoD extends OmitType(UpdateCompanyDto, [
  'picture_url',
]) {
  @ApiProperty({ description: 'Picture of the company profile' })
  @IsOptional()
  picture?: string;
}
