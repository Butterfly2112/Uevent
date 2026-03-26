import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';

export class updateCompanyNewsDto {
  @ApiProperty({
    description: 'New title of the company news',
    example: 'new Cat',
  })
  @MaxLength(50, { message: 'Title cannot be longer than 50 characters' })
  @MinLength(3, { message: 'Title cannot be shorter than 3 characters' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'New content of the company news',
    example: 'Change of plans. Sorry',
  })
  @MaxLength(500, { message: 'Content cannot be longer than 500 characters' })
  @MinLength(3, { message: 'Content cannot be shorter than 3 characters' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'New images of the company news',
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  images_url?: string[];
}
