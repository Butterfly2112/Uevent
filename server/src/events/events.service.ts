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
import { toEventResponse } from 'src/common/mappers/event.mapper';

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
}
