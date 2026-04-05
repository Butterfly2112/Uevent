import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorFilter } from './common/error.filter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { CompaniesModule } from './companies/companies.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeedService } from './seed.service';
import { User } from './users/entities/user.entity';
import { Comment } from './comments/entities/comment.entity';
import { Company } from './companies/entities/company.entity';
import { CompanyNews } from './companies/entities/company-news.entity';
import { Event } from './events/entities/event.entity';
import { PromoCode } from './events/entities/promo-code.entity';
import { Ticket } from './tickets/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('NODE_ENV') === 'development' || false,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Comment,
      Company,
      CompanyNews,
      Event,
      PromoCode,
      Ticket,
    ]),
    AuthModule,
    UsersModule,
    CommentsModule,
    CompaniesModule,
    EmailModule,
    EventsModule,
    TicketsModule,
    NotificationsModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    SeedService,
  ],
})
export class AppModule {}
