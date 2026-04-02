import { IsDate, IsNumber, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  code: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  discount_percentage: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  expires_at: Date;
}