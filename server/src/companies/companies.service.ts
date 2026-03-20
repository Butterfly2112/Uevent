import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { CompanyNews } from './entities/company-news.entity';
import { SafeCompanyResponseDto } from './dto/safeCompanyResponse.dto';
import { title } from 'process';
import { EventStatus } from 'src/events/entities/event.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyNews)
    private companyNewsRepository: Repository<CompanyNews>,
  ) {}

  async getUserCompany(
    userId: number,
    currentUserId: number | null,
  ): Promise<SafeCompanyResponseDto> {
    const info = await this.companyRepository.findOne({
      where: { owner: { id: userId } },
      select: {
        owner: {
          id: true,
          login: true,
          username: true,
          email: true,
          avatar_url: true,
        },
      },
      relations: { owner: true, events: true, news: true },
    });

    if (!info) {
      throw new NotFoundException('User have not registered company.');
    }

    return this.mapCompanyProfileToDTO(
      info,
      currentUserId ? currentUserId : null,
    );
  }

  async mapCompanyProfileToDTO(
    dbCompany: Company,
    currentUserId?: number | null,
  ): Promise<SafeCompanyResponseDto> {
    let visibleEvents = dbCompany.events || [];
    if (!currentUserId || currentUserId != dbCompany.owner.id) {
      visibleEvents = visibleEvents.filter(
        (event) => event.status !== EventStatus.DRAFT,
      );
    }

    return {
      id: dbCompany.id,
      owner: {
        id: dbCompany.owner.id,
        login: dbCompany.owner.login,
        username: dbCompany.owner.username,
        avatar_url: dbCompany.owner.avatar_url,
      },
      name: dbCompany.name,
      email_for_info: dbCompany.email_for_info,
      location: dbCompany.location,
      description: dbCompany.description,
      picture_url: dbCompany.picture_url,
      events: visibleEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        price: event.price,
        ticket_limit: event.ticket_limit,
        address: event.address,
        poster_url: event.poster_url,
        start_date: event.start_date,
        end_date: event.end_date,
        status: event.status,
        format: event.format,
        theme: event.theme,
      })),
      news: dbCompany.news.map((news) => ({
        id: news.id,
        title: news.title,
        content: news.content,
        images_url: news.images_url,
        created_at: news.created_at,
      })),
    };
  }
}
