import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { PromoCode } from './entities/promo-code.entity';
import { EventService } from './events.service';
import { EventController } from './events.controller';
import { CompaniesModule } from 'src/companies/companies.module';
import { UploadModule } from 'src/upload/upload.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    CompaniesModule,
    UploadModule,
    AuthModule,
    JwtModule.register({}),
    forwardRef(() => NotificationsModule),
    TypeOrmModule.forFeature([Event, PromoCode]),
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventsModule {}
