import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyNews } from './entities/company-news.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyNews])],
})
export class CompaniesModule {}
