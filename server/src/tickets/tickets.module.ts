import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { PromoCode } from 'src/events/entities/promo-code.entity';

import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaymentModule } from '../payments/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User, Event, PromoCode]),
    NotificationsModule,
    PaymentModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}