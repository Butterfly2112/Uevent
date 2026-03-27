import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { EventFormat, EventStatus, EventTheme } from '../entities/event.entity';

export class GetEventsDto {
  @ApiProperty({ required: false, description: 'Filter by company' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @ApiProperty({ required: false, enum: EventTheme })
  @IsOptional()
  @IsEnum(EventTheme)
  theme?: EventTheme;

  @ApiProperty({ required: false, enum: EventFormat })
  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @ApiProperty({ required: false, enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({
    required: false,
    example: 'start_date',
    enum: ['start_date', 'price'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'start_date' | 'price';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, example: '2026-01-01' })
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;

  @ApiProperty({ required: false, example: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false, example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ required: false, example: 'music festival' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false, example: 'Kyiv' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    required: false,
    description: 'Show only events with available tickets',
  })
  @IsOptional()
  @Type(() => Boolean)
  hasAvailableTickets?: boolean;
}
