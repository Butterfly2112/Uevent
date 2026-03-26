import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EventFormat, EventStatus, EventTheme } from '../entities/event.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({
    description: 'Owner wants to get notifications about new atendees or not',
  })
  @IsOptional()
  @IsBoolean()
  notificate_owner?: boolean;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Super secret event',
  })
  @MinLength(3, {
    message: 'Event title needs to be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Event title cannot be longer than 50 characters long',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'If you are reading this...',
  })
  @MinLength(3, {
    message: 'Event description needs to be at least 3 characters long',
  })
  @MaxLength(500, {
    message: 'Event description cannot be longer than 50 characters long',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Full price of the ticket for the event',
    example: 300,
  })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Limit of the tickets for the event',
    example: 67,
  })
  @IsNumber()
  @IsOptional()
  ticket_limit?: number;

  @ApiProperty({
    description: 'Address of the event',
    example: 'Willow Street, 13',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Poster of the event',
  })
  @IsOptional()
  poster_url?: string;

  @ApiProperty({
    description: 'Page where person will be sent after getting the ticket',
    example: 'https://mod.gov.ua/',
  })
  @IsOptional()
  redirect_url?: string;

  @ApiProperty({
    description: 'When event will start',
  })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    description: 'When event will end',
  })
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty({
    description: 'When event will be published and available to the public',
  })
  @IsDate()
  @Type(() => Date)
  publish_date: Date;

  @ApiProperty({
    description: 'Status of the event',
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({
    description: 'Format of the event',
    enum: EventFormat,
  })
  @IsEnum(EventFormat)
  @IsOptional()
  format?: EventFormat;

  @ApiProperty({
    description: 'Theme of the event',
    enum: EventTheme,
  })
  @IsEnum(EventTheme)
  @IsOptional()
  theme?: EventTheme;

  @ApiProperty({
    description: 'Who will be able to see atendees of the event',
    enum: ['everybody', 'attendees_only'],
  })
  @IsEnum(['everybody', 'attendees_only'])
  visitor_visibility: 'everybody' | 'attendees_only';
}

export class CreateEventDtoD extends OmitType(CreateEventDto, [
  'poster_url',
] as const) {
  @ApiProperty({
    description: 'Picture of the event',
  })
  @IsOptional()
  @IsString()
  file: string;
}
