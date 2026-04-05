import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyNews } from './entities/company-news.entity';
import { CompanyService } from './companies.service';
import { CompanyController } from './companies.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from 'src/upload/upload.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    UploadModule,
    NotificationsModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Company, CompanyNews]),
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompaniesModule {}
