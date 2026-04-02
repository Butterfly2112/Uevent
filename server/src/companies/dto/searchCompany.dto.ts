import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class searchCompanyDto {
  @ApiProperty({
    description:
      'Id of the company you are searching for. If you use this property than' +
      ' anything that goes to search is not being used and company is being found ONLY by exect id',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({
    description: 'part of company name/description/email_for_info',
    example: 'Evil',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
