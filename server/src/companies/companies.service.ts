import {
  ConflictException,
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

@Injectable()
export class CompanyService {
  constructor(
    private usersService: UsersService,
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
}
