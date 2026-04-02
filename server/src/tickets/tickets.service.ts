import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TicketStatus, Ticket } from './entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { PromoCode } from 'src/events/entities/promo-code.entity';

import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/types/notifications-type.enum';
import type { PaymentProvider } from 'src/payments/interfaces/payment-provider.interface';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(PromoCode)
    private promoRepo: Repository<PromoCode>,

    private notificationsService: NotificationsService,

    @Inject('PAYMENT_PROVIDER')
    private paymentProvider: PaymentProvider,
  ) {}

  // Створення білета
  async createTicket(dto: {
    userId: number;
    eventId: number;
    promoCodeId?: number;
  }): Promise<Ticket> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const event = await this.eventRepo.findOne({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const existing = await this.ticketRepo.findOne({
      where: {
        user: { id: dto.userId },
        event: { id: dto.eventId },
      },
    });

    if (existing) {
      throw new BadRequestException('Ticket already exists');
    }

    let finalPrice = Number(event.price);
    let promo: PromoCode | null = null;

    if (dto.promoCodeId) {
      const foundPromo = await this.promoRepo.findOne({
        where: { id: dto.promoCodeId },
      });

      if (!foundPromo) throw new NotFoundException('Promo code not found');

      if (foundPromo.expires_at < new Date()) {
        throw new BadRequestException('Promo code expired');
      }

      promo = foundPromo;
      finalPrice = finalPrice - (finalPrice * promo.discount_percentage) / 100;
    }

    const ticket = this.ticketRepo.create({
      user,
      event,
      promo_code: promo ?? undefined,
      price_paid: finalPrice,
      status: TicketStatus.PENDING,
    });

    return await this.ticketRepo.save(ticket);
  }

  async createPayment(ticketId: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const payment = await this.paymentProvider.createPaymentIntent(
      ticket.price_paid,
    );

    ticket.payment_intent_id = payment.id;
    await this.ticketRepo.save(ticket);

    return {
      paymentIntentId: payment.id,
      clientSecret: payment.client_secret,
    };
  }

  // Оплата білета
  async payTicket(ticketId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['user', 'event'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status === TicketStatus.PAID) {
      throw new BadRequestException('Already paid');
    }
    if (!ticket.payment_intent_id) {
      throw new BadRequestException('Payment not initialized');
    }

    await this.paymentProvider.confirmPayment(ticket.payment_intent_id);

    ticket.status = TicketStatus.PAID;

    const saved = await this.ticketRepo.save(ticket);

    const ticketData = {
      id: ticket.id,
      eventTitle: ticket.event.title,
      eventDate: ticket.event.start_date,
      price: ticket.price_paid,
      promoCode: ticket.promo_code?.code,
    };


    await this.notificationsService.createNotification({
      user: ticket.user,
      type: NotificationType.TICKET_PURCHASE,
      event: ticket.event,
      ticket: ticketData,
    });

    await this.notificationsService.createNotification({
      user: ticket.user,
      type: NotificationType.PAYMENT_SUCCESS,
      event: ticket.event,
      ticket: ticketData,
    });

    return saved;
  }

  async refundTicket(ticketId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['user', 'event'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status !== TicketStatus.PAID) {
      throw new BadRequestException('Ticket is not paid');
    }

    if (!ticket.payment_intent_id) {
      throw new BadRequestException('No payment intent found');
    }

    await this.paymentProvider.refund(ticket.payment_intent_id);

    ticket.status = TicketStatus.REFUNDED;

    const saved = await this.ticketRepo.save(ticket);

    await this.notificationsService.createNotification({
      user: ticket.user,
      type: NotificationType.REFUND_SUCCESS,
      event: ticket.event,
      ticket: {
        id: ticket.id,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.start_date,
        price: ticket.price_paid,
      },
    });

    return saved;
  }
}
