import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { CompanyNews } from './entities/company-news.entity';
import { SafeCompanyResponse } from './types/safeCompanyResponse.type';
import { RegisterCompanyDto } from './dto/registerCompany.dto';
import { UsersService } from 'src/users/users.service';
import {
  mapCompanyForAdmin,
  mapCompanyProfileToDTO,
} from 'src/common/mappers/company.mapper';
import { UploadService } from 'src/upload/upload.service';
import { CreateCompanyNewsDto } from './dto/createCompanyNews.dto';
import { CompanyNewsResponse } from './types/companyNewsResponse.type';
import { UpdateCompanyNewsDto } from './dto/updateCompanyNews.dto';
import { UpdateCompanyDto } from './dto/updateCompany.dto';
import { EventStatus } from 'src/events/entities/event.entity';
import { searchCompanyDto } from './dto/searchCompany.dto';
import { CompaniesForAdminResponse } from './types/companyForAdminResponse.dto';

@Injectable()
export class CompanyService {
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyNews)
    private companyNewsRepository: Repository<CompanyNews>,
  ) {}

  async registerCompany(
    registerDto: RegisterCompanyDto,
    userId: number,
  ): Promise<SafeCompanyResponse> {
    const hasCompany = await this.usersService.userHasCompany(userId);
    if (hasCompany) {
      if (registerDto.picture_url)
        this.uploadService.deleteByUrl(registerDto.picture_url);
      throw new ConflictException('User already has company');
    }

    const user = await this.usersService.getUserById(userId);

    const company = await this.companyRepository.save({
      owner: user,
      name: registerDto.name,
      email_for_info: registerDto.email_for_info,
      location: registerDto.location,
      description: registerDto.description,
      picture_url: registerDto.picture_url,
    });

    return mapCompanyProfileToDTO(company);
  }

  /**
   * Returns information about company. Information returned depends on the permissions that are being assigned depending on the permissions (guest/user/owner/admin)
   * @param companyId Company id
   * @param currentUserId Current user id who is searching
   * @returns company info
   */
  async getCompanyById(
    companyId: number,
    currentUserId: number | null,
  ): Promise<SafeCompanyResponse> {
    const info = await this.companyRepository.findOne({
      where: { id: companyId },
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
      throw new NotFoundException('Company not found.');
    }

    let isFollowing = false;

    if (currentUserId && currentUserId !== info.owner.id) {
      const count = await this.companyRepository.manager
        .createQueryBuilder()
        .from('subscriptions', 'sub')
        .where('sub.subscriber_id = :currentUserId', { currentUserId })
        .andWhere('sub.subscribed_to_id = :ownerId', { ownerId: info.owner.id })
        .getCount();

      isFollowing = count > 0;
    }

    return mapCompanyProfileToDTO(info, currentUserId, isFollowing);
  }

  async deleteCompanyById(
    companyId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: { owner: true, news: true },
    });

    if (userRole != 'admin' && userId != company?.owner?.id) {
      throw new ForbiddenException(
        'Only owner of the company or admin can delete it',
      );
    }

    if (company?.picture_url) {
      this.uploadService.deleteByUrl(company?.picture_url);
    }

    if (company?.news) {
      company.news.forEach((elem) => {
        if (elem.images_url)
          elem.images_url.forEach((el) => this.uploadService.deleteByUrl(el));
      });
    }

    await this.companyRepository.manager
      .createQueryBuilder()
      .update('events')
      .set({ status: EventStatus.CANCELED })
      .where('company_id = :companyId', { companyId })
      .execute();

    await this.companyRepository.delete({ id: companyId });
  }

  async getCompanyNews(companyId: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      select: { id: true, news: true },
      relations: { news: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async createCompanyNews(
    companyId: number,
    dto: CreateCompanyNewsDto,
    userId: number,
  ): Promise<CompanyNewsResponse> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: { owner: true },
    });

    if (!company || company.owner.id !== userId) {
      if (dto.images_url)
        dto.images_url.forEach((image) =>
          this.uploadService.deleteByUrl(image),
        );
      if (!company) throw new NotFoundException('Company not found');
      throw new ForbiddenException('Only owner of the company can post news');
    }

    const news = await this.companyNewsRepository.save({ ...dto, company });
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      images_url: news.images_url,
      created_at: news.created_at,
      updated_at: news.updated_at,
    };
  }

  async deleteCompanyNews(
    companyNewsId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const companyNews = await this.companyNewsRepository.findOne({
      where: { id: companyNewsId },
      relations: { company: { owner: true } },
    });

    if (!companyNews) {
      throw new NotFoundException('CompanyNews not found');
    }
    if (companyNews.company.owner.id != userId && userRole != 'admin') {
      throw new ForbiddenException(
        'Only owner or admin can delete company news',
      );
    }

    if (companyNews.images_url) {
      companyNews.images_url.forEach((imageUrl) =>
        this.uploadService.deleteByUrl(imageUrl),
      );
    }

    await this.companyNewsRepository.delete({ id: companyNewsId });
  }

  async updateCompanyNews(
    companyNewsId: number,
    dto: UpdateCompanyNewsDto,
    userId: number,
  ): Promise<CompanyNewsResponse> {
    const companyNews = await this.companyNewsRepository.findOne({
      where: { id: companyNewsId },
      relations: { company: { owner: true } },
    });

    if (!companyNews || companyNews.company.owner.id != userId) {
      if (dto.images_url)
        dto.images_url.forEach((image) =>
          this.uploadService.deleteByUrl(image),
        );
      if (!companyNews) throw new NotFoundException('CompanyNews not found');
      throw new ForbiddenException('Only owner can update company news');
    }

    if (dto.images_url || companyNews.images_url) {
      companyNews.images_url.forEach((imageUrl) =>
        this.uploadService.deleteByUrl(imageUrl),
      );
    }

    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined),
    );

    Object.assign(companyNews, updateData);

    const news = await this.companyNewsRepository.save(companyNews);

    return {
      id: news.id,
      title: news.title,
      content: news.content,
      images_url: news.images_url,
      created_at: news.created_at,
      updated_at: news.updated_at,
    };
  }

  async updateCompany(
    companyId: number,
    dto: UpdateCompanyDto,
    userId: number,
  ): Promise<SafeCompanyResponse> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: { owner: true, news: true, events: true },
    });

    if (!company || company.owner.id != userId) {
      if (dto.picture_url) this.uploadService.deleteByUrl(dto.picture_url);
      if (!company) throw new NotFoundException('Company not found');
      throw new ForbiddenException('Only owner can update company');
    }

    if (dto.picture_url || company.picture_url) {
      this.uploadService.deleteByUrl(company.picture_url);
    }

    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined),
    );

    Object.assign(company, updateData);

    const company2 = await this.companyRepository.save(company);
    return mapCompanyProfileToDTO(company2, userId);
  }

  async getCompanyByIdForServices(companyId: number): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { id: companyId },
      relations: { owner: true, events: true },
    });
  }

  async searchCompany(
    currentUserRole: string,
    dto: searchCompanyDto,
  ): Promise<CompaniesForAdminResponse> {
    if (currentUserRole !== 'admin')
      throw new ForbiddenException('Only admin allowed to perform such action');

    if (dto.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: dto.companyId },
        relations: { owner: true },
      });
      if (!company)
        throw new NotFoundException('Company with this id not found');
      return { companies: [mapCompanyForAdmin(company)], total: 1 };
    }

    const [companies, total] = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.owner', 'owner')
      .andWhere(
        '(company.name ILIKE :search OR company.description ILIKE :search OR company.email_for_info ILIKE :search)',
        { search: `%${dto.search}%` },
      )
      .getManyAndCount();

    return { companies: companies.map(mapCompanyForAdmin), total };
  }
}
