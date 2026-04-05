import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { EventResponse } from './types/eventResponse.type';
import { UpdateEventDto, UpdateEventDtoD } from './dto/updateEvent.dto';
import { JwtType } from 'src/auth/types/jwtType.type';
import { AuthService } from 'src/auth/auth.service';
import { GetEventsDto } from './dto/getEvents.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(
    private eventService: EventService,
    private uploadService: UploadService,
    private authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Get events for user based on following companies',
  })
  @Get('feed')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getUserFeed(@Req() req: RequestWithUser) {
    return await this.eventService.getUserFeed(req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Get list of events with filters' })
  @ApiOkResponse({ type: EventResponse, isArray: true })
  async getEvents(
    @Query() dto: GetEventsDto,
    @Headers('authorization') authHeader?: string,
  ) {
    let user: JwtType | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      user = await this.authService.getUserFromToken(authHeader);
    }

    return this.eventService.searchEvents(dto, user?.role);
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard)
  async followEvent(@Req() req: RequestWithUser, @Param('id') param: number) {
    await this.eventService.followTheEvent(param, req.user.id);
    return {
      message: 'Followed the event successfully',
    };
  }

  @Post(':id/unfollow')
  @UseGuards(AuthGuard)
  async unfollowEvent(@Req() req: RequestWithUser, @Param('id') param: number) {
    await this.eventService.unfollowTheEvent(param, req.user.id);
    return {
      message: 'Unfollowed the event successfully',
    };
  }

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

  @ApiOperation({
    summary: 'Update Event',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Event id',
  })
  @ApiBody({
    type: UpdateEventDtoD,
  })
  @ApiNotFoundResponse({
    description: 'Event not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner allowed to update event',
  })
  @ApiOkResponse({
    description: 'Event updated successfully',
    type: EventResponse,
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(EventPosterUploadInterceptor)
  async updateEvent(
    @Param('id') param: number,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const poster_url = file
      ? this.uploadService.getFileUrl('event-posters', file.filename)
      : undefined;

    return await this.eventService.updateEvent(param, req.user.id, {
      ...dto,
      poster_url,
    });
  }

  @ApiOperation({
    summary: 'Get event details',
    description:
      'If user is logged in and is host of this event - events of all status will be returned alongside company information. ' +
      'Otherwise strict visibility filtration will be user to retrieve information visible depending on users permissions or ' +
      'will not be retrieved at all if this event yet not available to the public',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved event info',
    type: EventResponse,
  })
  @ApiNotFoundResponse({
    description: 'Event not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Event id',
  })
  @Get(':id')
  async getEventInfo(
    @Param('id') param: number,
    @Headers('authorization') authHeader?: string,
  ) {
    let user: JwtType | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      user = await this.authService.getUserFromToken(authHeader);
    }

    return this.eventService.getEventDetailedById(
      param,
      user ? user.id : undefined,
      user ? user.role : undefined,
    );
  }

  @ApiOperation({
    summary: 'Delete event',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Event id',
  })
  @ApiNotFoundResponse({
    description: 'Event not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner or admin can delete event',
  })
  @ApiOkResponse({
    description: 'Event deleted successfully',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteEvent(@Param('id') param: number, @Req() req: RequestWithUser) {
    await this.eventService.deleteEvent(param, req.user.id, req.user.role);

    return {
      message: 'Event deleted successfully',
    };
  }
}
