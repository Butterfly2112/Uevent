import { ApiProperty } from '@nestjs/swagger';
import {
  EventFormat,
  EventStatus,
  EventTheme,
} from 'src/events/entities/event.entity';

export class SafeCompanyResponseDto {
  @ApiProperty({ description: 'Id of the company', example: '1' })
  id: number;
  @ApiProperty({ description: 'Information about owner of the company' })
  owner: {
    id: number;
    login: string;
    username: string;
    avatar_url: string;
  };
  @ApiProperty({
    description: 'Name of the company',
    example: 'Doofenshmirtz Evil Incorporated',
  })
  name: string;
  @ApiProperty({
    description: 'Email for reaching company',
    example: 'corporation@example.com',
  })
  email_for_info: string;
  @ApiProperty({
    description: 'Location of the company',
    example: '13, Willow Street',
  })
  location: string;
  @ApiProperty({
    description: 'About company',
    example: 'Evil corporation for -enators',
  })
  description: string;
  @ApiProperty({ description: 'Picture of the company profile' })
  picture_url: string;
  @ApiProperty({
    description: 'Inforamtion about events this corporation hosting',
  })
  events: {
    id: number;
    title: string;
    description: string;
    price: number;
    ticket_limit: number;
    address: string;
    poster_url: string;
    start_date: Date;
    end_date: Date;
    status: EventStatus;
    format: EventFormat;
    theme: EventTheme;
  }[];
  @ApiProperty({ description: 'Company news' })
  news: {
    id: number;
    title: string;
    content: string;
    images_url: string[];
    created_at: Date;
  }[];
}
