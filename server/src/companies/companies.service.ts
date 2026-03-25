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
import { mapCompanyProfileToDTO } from 'src/common/mappers/company.mapper';
import { UploadService } from 'src/upload/upload.service';
import { createCompanyNewsDto } from './dto/createCompanyNews.dto';
import { CompanyNewsResponse } from './types/companyNewsResponse.type';

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
   * @param compahyId Company id
   * @param currentUserId Current user id who is searching
   * @returns company info
   */
  async getCompanyById(
    compahyId: number,
    currentUserId: number | null,
  ): Promise<SafeCompanyResponse> {
    const info = await this.companyRepository.findOne({
      where: { id: compahyId },
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

    return mapCompanyProfileToDTO(info, currentUserId ? currentUserId : null);
  }

  async deleteCompanyById(companyId: number, userId: number): Promise<void> {
    const user = await this.usersService.getUserByIdDetailed(userId, userId);

    if (user.role != 'admin' && user.company?.id != companyId) {
      throw new ForbiddenException(
        'Only owner of the company or admin can delete it',
      );
    }

    //Реалізувати скасування всих івентів дотичних до компанії та повернення грошей за вже викуплені білети
    if (user.company?.picture_url) {
      await this.uploadService.deleteByUrl(user.company?.picture_url);
    }

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
    dto: createCompanyNewsDto,
    userId: number,
  ): Promise<CompanyNewsResponse> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: { owner: true },
    });

    if (!company) {
      if (dto.images_url)
        dto.images_url.forEach((image) =>
          this.uploadService.deleteByUrl(image),
        );
      throw new NotFoundException('Company not found');
    }
    if (company.owner.id !== userId) {
      if (dto.images_url)
        dto.images_url.forEach((image) =>
          this.uploadService.deleteByUrl(image),
        );
      throw new ForbiddenException('Only owner of the company can post news');
    }

    const news = await this.companyNewsRepository.save({ ...dto, company });
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      images_url: news.images_url,
      created_at: news.created_at,
    };
  }
}
