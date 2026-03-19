import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyNews } from './entities/company-news.entity';
import { CompanyService } from './companies.service';
import { CompanyController } from './companies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyNews])],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompaniesModule {}
