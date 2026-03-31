import { ApiProperty } from '@nestjs/swagger';
import { EventResponse } from 'src/events/types/eventResponse.type';
import { CompanyNewsResponse } from './companyNewsResponse.type';

export class SafeCompanyResponse {
  @ApiProperty({ description: 'Id of the company', example: '1' })
  id: number;

  @ApiProperty({
    description: 'Basic information about the company owner',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      login: { type: 'string', example: 'best dad' },
      username: { type: 'string', example: 'Doofenshmirtz' },
      avatar_url: { type: 'string', example: 'https://example.com/avatar.png' },
    },
  })
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
  events: EventResponse[];

  @ApiProperty({
    description: 'News published by this company',
    type: CompanyNewsResponse,
    isArray: true,
  })
  news: CompanyNewsResponse[];

  @ApiProperty({
    description: 'Is current user following company owner or not',
  })
  is_following?: boolean;
}
