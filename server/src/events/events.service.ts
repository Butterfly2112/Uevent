import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventResponse } from './types/eventResponse.type';
import { CompanyService } from 'src/companies/companies.service';
import { CreateEventDto } from './dto/createEvent.dto';
import { UploadService } from 'src/upload/upload.service';
import { Event } from './entities/event.entity';
import {
  checkVisibilityOfEvent,
  toEventResponse,
} from 'src/common/mappers/event.mapper';
import { UpdateEventDto } from './dto/updateEvent.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    private companyService: CompanyService,
    private uploadService: UploadService,
  ) {}

  async createEvent(
    companyId: number,
    userId: number,
    dto: CreateEventDto,
  ): Promise<EventResponse> {
    const company =
      await this.companyService.getCompanyByIdForServices(companyId);

    if (!company) {
      if (dto.poster_url) {
        this.uploadService.deleteByUrl(dto.poster_url);
      }
      throw new NotFoundException('Company not found');
    }
    if (company.owner.id != userId) {
      if (dto.poster_url) {
        this.uploadService.deleteByUrl(dto.poster_url);
      }
      throw new ForbiddenException(
        'Only owner of the company can create events',
      );
    }

    const event = await this.eventRepository.save({
      company: company,
      host: company.owner,
      ...dto,
    });

    return toEventResponse(event, {
      owner: true,
      admin: company.owner.role == 'admin',
      isAttendee: true,
    });
  }

  async updateEvent(
    eventId: number,
    userId: number,
    dto: UpdateEventDto,
  ): Promise<EventResponse> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { company: { owner: true } },
    });

    if (!event || event.company.owner.id != userId) {
      if (dto.poster_url) {
        this.uploadService.deleteByUrl(dto.poster_url);
      }
      if (!event) throw new NotFoundException('Event not found');
      throw new ForbiddenException('Only owner can update event');
    }

    if (dto.poster_url && event.poster_url) {
      this.uploadService.deleteByUrl(event.poster_url);
    }

    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined),
    );

    Object.assign(event, updateData);

    const updatedEvent = await this.eventRepository.save(event);
    return toEventResponse(updatedEvent, {
      owner: true,
      admin: event.company.owner.role == 'admin',
      isAttendee: true,
    });
  }

  async getEventDetailedById(
    eventId: number,
    userId?: number,
    userRole?: string,
  ) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: {
        company: true,
        host: true,
        tickets: { user: true },
        comments: true,
        promo_codes: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const visible_event = checkVisibilityOfEvent(
      event,
      {
        owner: userId === event.host.id,
        admin: userRole === 'admin',
      },
      userId,
    );

    if (!visible_event) {
      throw new NotFoundException('Event not found');
    }

    return visible_event;
  }
}
