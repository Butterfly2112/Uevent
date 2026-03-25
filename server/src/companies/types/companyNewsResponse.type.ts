import { ApiProperty } from '@nestjs/swagger';

export class CompanyNewsResponse {
  @ApiProperty({
    description: 'Id of the news',
    example: '69',
  })
  id: number;

  @ApiProperty({
    description: 'Title of the news',
    example: 'We are Evil',
  })
  title: string;

  @ApiProperty({
    description: 'Content of the news',
    example: 'Who could have guessed',
  })
  content: string;

  @ApiProperty({
    description: 'Array of the images in the news',
  })
  images_url: string[];

  @ApiProperty({
    description: 'Date when news were created',
  })
  created_at: Date;
}
