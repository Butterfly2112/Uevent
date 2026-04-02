import { ApiProperty } from '@nestjs/swagger';

export class CompanyForAdminResponse {
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

  @ApiProperty({ description: 'Date when company were created' })
  created_at: Date;
}

export class CompaniesForAdminResponse {
  @ApiProperty({
    description: 'All companies that matched search options',
    type: [CompanyForAdminResponse],
  })
  companies: CompanyForAdminResponse[] | [];

  @ApiProperty({
    description: 'Total number of companies found',
    example: 1,
  })
  total: number;
}
