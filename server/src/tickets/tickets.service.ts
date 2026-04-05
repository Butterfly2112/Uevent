import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

import { TicketStatus, Ticket } from './entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { PromoCode } from 'src/events/entities/promo-code.entity';
import { EventStatus } from 'src/events/entities/event.entity';

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

    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,

    @Inject('PAYMENT_PROVIDER')
    private paymentProvider: PaymentProvider,
  ) {}

  // Створення білета
  async createTicket(dto: {
    userId: number;
    eventId: number;
    promoCode?: string;
  }): Promise<Ticket> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const event = await this.eventRepo.findOne({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (![EventStatus.PLANNED, EventStatus.ACTIVE].includes(event.status)) {
      throw new BadRequestException('Tickets are not available for this event');
    }

    if (event.ticket_limit) {
      const soldTickets = await this.ticketRepo.count({
        where: {
          event: { id: dto.eventId },
          status: TicketStatus.PAID,
        },
      });

      if (soldTickets >= event.ticket_limit) {
        throw new BadRequestException('All tickets are sold out');
      }
    }

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

    if (dto.promoCode) {
      const foundPromo = await this.validatePromoCode(
        dto.eventId,
        dto.promoCode,
      );

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

    if (ticket.price_paid <= 0) {
      ticket.status = TicketStatus.PAID;
      await this.ticketRepo.save(ticket);

      return { free: true };
    }

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
  async payTicket(ticketId: number): Promise<{
    ticket: Ticket;
    redirect_url: string | null;
  }> {
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

    if (ticket.event.ticket_limit) {
      const soldTickets = await this.ticketRepo.count({
        where: {
          event: { id: ticket.event.id },
          status: TicketStatus.PAID,
        },
      });

      if (soldTickets >= ticket.event.ticket_limit) {
        throw new BadRequestException('Tickets are sold out');
      }
    }

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

    return {
      ticket: saved,
      redirect_url: ticket.event.redirect_url,
    };
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
      ticket.status = TicketStatus.REFUNDED;
      return this.ticketRepo.save(ticket);
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

  async getEventParticipants(eventId: number): Promise<User[]> {
    const tickets = await this.ticketRepo.find({
      where: {
        event: { id: eventId },
        status: TicketStatus.PAID,
      },
      relations: ['user'],
    });

    const uniqueUsers = new Map<number, User>();

    for (const ticket of tickets) {
      uniqueUsers.set(ticket.user.id, ticket.user);
    }

    return Array.from(uniqueUsers.values());
  }

  async validatePromoCode(eventId: number, code: string) {
    const promo = await this.promoRepo.findOne({
      where: {
        code,
        event: { id: eventId },
      },
    });

    if (!promo) {
      throw new BadRequestException('Invalid promo code');
    }

    if (promo.expires_at < new Date()) {
      throw new BadRequestException('Promo code expired');
    }

    return promo;
  }

  async generatePdf(ticketId: number, userId: number, res: Response) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['user', 'event'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.user.id !== userId) {
      throw new BadRequestException('Access denied');
    }

    if (ticket.status !== TicketStatus.PAID) {
      throw new BadRequestException('Ticket is not paid');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${ticket.id}.pdf`,
    );

    doc.on('error', (err) => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send('PDF error');
      }
    });

    doc.pipe(res);

    // дизайн
    doc.roundedRect(50, 100, 500, 280, 15).fillAndStroke('#fffde7', '#ffd43b');

    doc.fontSize(22).fillColor('#222').text('EVENT TICKET', 50, 120, {
      align: 'center',
    });

    doc.fontSize(16).fillColor('#000').text(ticket.event.title, 80, 240);

    doc.fontSize(14).fillColor('#555').text('Date:', 80, 270);
    doc.text(new Date(ticket.event.start_date).toLocaleString(), 80, 290);

    doc.text('Attendee:', 80, 320);
    doc.fontSize(16).fillColor('#000').text(ticket.user.login, 80, 340);

    doc
      .roundedRect(380, 220, 120, 80, 10)
      .fillAndStroke('#ffe066', '#ffd43b');

    doc.fillColor('#000').fontSize(20).text(`${ticket.price_paid}`, 380, 250, {
      align: 'center',
      width: 120,
    });

    doc.end();
  }

  async getUserTickets(userId: number): Promise<Ticket[]> {
    return this.ticketRepo.find({
      where: {
        user: { id: userId },
        status: TicketStatus.PAID,
      },
      relations: ['event'],
      order: {
        id: 'DESC',
      },
    });
  }
}
