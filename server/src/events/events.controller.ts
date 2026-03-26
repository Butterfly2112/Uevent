import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './events.service';
import { AuthGuard } from 'src/common/auth.guard';
import { EventPosterUploadInterceptor } from 'src/upload/upload.interceptor';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { CreateEventDto, CreateEventDtoD } from './dto/createEvent.dto';
import { UploadService } from 'src/upload/upload.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { EventResponse } from './types/eventResponse.type';

@Controller('events')
export class EventController {
  constructor(
    private eventService: EventService,
    private uploadService: UploadService,
  ) {}

  @ApiOperation({
    summary: 'Create event',
  })
  @ApiParam({
    name: 'companyId',
    type: Number,
    description: 'Company Id',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateEventDtoD,
  })
  @ApiNotFoundResponse({
    description: 'Company with such id not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner of the company can create events',
  })
  @ApiCreatedResponse({
    description: 'Event were created successfully',
    type: EventResponse,
  })
  @Post(':companyId')
  @UseGuards(AuthGuard)
  @UseInterceptors(EventPosterUploadInterceptor)
  async createEvent(
    @Param('companyId') param: number,
    @Req() req: RequestWithUser,
    @Body() dto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const poster_url = file
      ? this.uploadService.getFileUrl('event-posters', file.filename)
      : undefined;

    return await this.eventService.createEvent(param, req.user.id, {
      ...dto,
      poster_url,
    });
  }
}
