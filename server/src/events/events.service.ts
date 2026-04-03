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
  toVisibleEvents,
} from 'src/common/mappers/event.mapper';
import { UpdateEventDto } from './dto/updateEvent.dto';
import { GetEventsDto } from './dto/getEvents.dto';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodeDto } from './dto/promoCodeDto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    private companyService: CompanyService,
    private uploadService: UploadService,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
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

    const promoCodes = (dto.promoCodes ?? []).map((p: PromoCodeDto) => ({
      code: p.code,
      discount_percentage: p.discount_percentage,
      expires_at: p.expires_at,
    }));

    if (promoCodes.length > 0) {
      if (promoCodes.length > 5) {
        throw new ForbiddenException('Maximum 5 promo codes allowed');
      }

      const promoEntities = promoCodes.map((p) =>
        this.promoCodeRepository.create({
          ...p,
          event: event,
        }),
      );

      await this.promoCodeRepository.save(promoEntities);
    }

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
        comments: {
          parent: true,
          author: true,
        },
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

  async deleteEvent(
    eventId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { host: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.host.id != userId && userRole != 'admin') {
      throw new ForbiddenException('Only owner and admin can delete event');
    }

    if (event.poster_url) {
      this.uploadService.deleteByUrl(event.poster_url);
    }

    //Create function that will cancel all the tickets

    await this.eventRepository.delete(eventId);
  }

  async searchEvents(
    dto: GetEventsDto,
    currentUserRole?: string,
  ): Promise<{ data: EventResponse[]; total: number }> {
    const now = new Date();

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.company', 'company')
      .leftJoinAndSelect('company.owner', 'owner')
      .leftJoinAndSelect('event.host', 'host')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .leftJoinAndSelect('ticket.user', 'ticketUser');

    if (dto.companyId) {
      qb.andWhere('company.id = :companyId', { companyId: dto.companyId });
    }

    if (dto.theme) {
      qb.andWhere('event.theme = :theme', { theme: dto.theme });
    }

    if (dto.format) {
      qb.andWhere('event.format = :format', { format: dto.format });
    }

    if (dto.status) {
      qb.andWhere('event.status = :status', { status: dto.status });
    }

    if (dto.dateFrom) {
      qb.andWhere('event.start_date >= :dateFrom', { dateFrom: dto.dateFrom });
    }

    if (dto.dateTo) {
      qb.andWhere('event.end_date <= :dateTo', { dateTo: dto.dateTo });
    }

    if (dto.minPrice !== undefined) {
      qb.andWhere('event.price >= :minPrice', { minPrice: dto.minPrice });
    }

    if (dto.maxPrice !== undefined) {
      qb.andWhere('event.price <= :maxPrice', { maxPrice: dto.maxPrice });
    }

    if (dto.address) {
      qb.andWhere('event.address ILIKE :address', {
        address: `%${dto.address}%`,
      });
    }

    if (dto.search) {
      qb.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search OR company.name ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.hasAvailableTickets) {
      qb.andWhere(
        '(event.ticket_limit IS NULL OR event.ticket_limit > (SELECT COUNT(*) FROM tickets t WHERE t.event_id = event.id))',
      );
    }

    const sortField = dto.sortBy ?? 'start_date';
    const sortOrder = dto.sortOrder ?? 'ASC';
    qb.orderBy(`event.${sortField}`, sortOrder);

    qb.skip(dto.offset ?? 0).take(dto.limit ?? 20);

    const [events, total] = await qb.getManyAndCount();

    const safeEvents = toVisibleEvents(events, {
      owner: false,
      admin: currentUserRole === 'admin',
    });

    return { data: safeEvents, total };
  }

  async getEventById(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async getUserFeed(userId: number): Promise<EventResponse[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.host', 'host')
      .innerJoin('host.followers', 'follower', 'follower.id = :userId', {
        userId,
      })
      .orderBy('event.start_date', 'DESC')
      .limit(15)
      .getMany();

    return toVisibleEvents(events, { owner: false, admin: false }, userId);
  }

  async getEventForService(eventId: number): Promise<Event | null> {
    return await this.eventRepository.findOne({
      where: { id: eventId },
      select: { host: { id: true } },
      relations: { host: true },
    });
  }
}
