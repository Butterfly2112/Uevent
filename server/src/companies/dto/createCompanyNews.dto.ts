import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyNewsDto {
  @ApiProperty({
    description: 'Title of the news',
    example: 'SENSATION!',
  })
  @MaxLength(50, { message: 'Title cannot be longer than 50 characters' })
  @MinLength(3, { message: 'Title cannot be shorter than 3 characters' })
  title: string;

  @ApiProperty({
    description: 'Content of the news',
    example: 'In the last week in Zhytomyr 7 days have passed',
  })
  @MaxLength(500, { message: 'Content cannot be longer than 500 characters' })
  @MinLength(3, { message: 'Content cannot be shorter than 3 characters' })
  content: string;

  @ApiProperty({
    description: 'Images that are being attached to the news',
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  images_url?: string[];
}

export class CreateCompanyNewsDtoD extends OmitType(CreateCompanyNewsDto, [
  'images_url',
]) {
  @ApiProperty({
    description: 'Images that are being attached to the news',
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  images?: string[];
}
