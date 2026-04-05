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

import * as path from 'path';
import * as fs from 'fs';

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
    user_is_visible_to_public?: boolean;
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
      where: [
        {
          user: { id: dto.userId },
          event: { id: dto.eventId },
          status: TicketStatus.PAID,
        },
        {
          user: { id: dto.userId },
          event: { id: dto.eventId },
          status: TicketStatus.PENDING,
        },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        'You already have an active ticket for this event',
      );
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
      user_is_visible_to_public: dto.user_is_visible_to_public ?? true,
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

    const eventWithHost = await this.eventRepo.findOne({
      where: { id: ticket.event.id },
      relations: { host: true },
    });
    if (eventWithHost?.notificate_owner && eventWithHost.host) {
      await this.notificationsService.createNotification({
        user: eventWithHost.host,
        type: NotificationType.EVENT_NEW_PARTICIPANT,
        event: ticket.event,
        userName: ticket.user.username,
      });
    }

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

  async getEventParticipants(
    eventId: number,
    currentUserId?: number,
  ): Promise<User[]> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['host'],
    });

    if (!event) throw new NotFoundException('Event not found');

    const tickets = await this.ticketRepo.find({
      where: {
        event: { id: eventId },
        status: TicketStatus.PAID,
      },
      relations: ['user'],
    });

    const isOwner = currentUserId && event.host?.id === Number(currentUserId);

    const participants: User[] = [];
    const addedUserIds = new Set<number>();

    for (const ticket of tickets) {
      const user = ticket.user;

      if (addedUserIds.has(user.id)) continue;

      const isSelf = currentUserId && user.id === Number(currentUserId);
      const isPubliclyVisible = ticket.user_is_visible_to_public === true;

      if (isPubliclyVisible || isOwner || isSelf) {
        participants.push(user);
        addedUserIds.add(user.id);
      }
    }

    return participants;
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

    doc.pipe(res);

    try {
      const regularFontPath = path.join(
        process.cwd(),
        'assets',
        'fonts',
        'Roboto-Regular.ttf',
      );

      if (fs.existsSync(regularFontPath)) {
        doc.registerFont('Roboto', regularFontPath);
        doc.font('Roboto');
      } else {
        doc.font('Helvetica');
      }

      doc
        .roundedRect(50, 100, 500, 260, 15)
        .fillAndStroke('#fffde7', '#ffd43b');

      doc
        .moveTo(380, 100)
        .lineTo(380, 360)
        .dash(5, { space: 5 })
        .stroke('#ffd43b');
      doc.undash();

      const defaultImagePath = path.join(
        process.cwd(),
        'assets',
        'images',
        'default-event.png',
      );

      console.log('Шукаю дефолтне фото за адресою:', defaultImagePath);
      console.log('Чи існує файл:', fs.existsSync(defaultImagePath));
      let finalImagePath = defaultImagePath;

      if (ticket.event.poster_url && ticket.event.poster_url !== 'default') {
        const localImagePath = path.join(
          process.cwd(),
          ticket.event.poster_url.replace(/^\//, ''),
        );

        if (fs.existsSync(localImagePath)) {
          finalImagePath = localImagePath;
        }
      }

      try {
        if (fs.existsSync(finalImagePath)) {
          doc.image(finalImagePath, 70, 120, {
            fit: [120, 120],
            align: 'center',
            valign: 'center',
          });
        } else {
          doc.rect(70, 120, 120, 120).fill('#ffe066');
          doc
            .fillColor('#bfa800')
            .fontSize(12)
            .text('No Image', 70, 175, { width: 120, align: 'center' });
        }
      } catch (e) {
        console.warn('Could not render poster for PDF:', e);
      }

      doc.fontSize(20).fillColor('#222').text(ticket.event.title, 210, 120, {
        width: 150,
        height: 50,
        ellipsis: true,
      });

      doc.fontSize(12).fillColor('#888').text('Date & Time:', 210, 170);
      doc
        .fontSize(14)
        .fillColor('#000')
        .text(new Date(ticket.event.start_date).toLocaleString(), 210, 185);

      if (ticket.event.address) {
        doc.fontSize(12).fillColor('#888').text('Location:', 210, 215);
        doc
          .fontSize(14)
          .fillColor('#000')
          .text(ticket.event.address, 210, 230, {
            width: 160,
          });
      }

      doc.fontSize(12).fillColor('#888').text('Attendee:', 70, 270);
      doc.fontSize(16).fillColor('#222').text(ticket.user.login, 70, 285);

      doc
        .fontSize(14)
        .fillColor('#888')
        .text('PRICE', 390, 140, { width: 140, align: 'center' });
      doc
        .fontSize(24)
        .fillColor('#000')
        .text(`${ticket.price_paid} UAH`, 390, 160, {
          width: 140,
          align: 'center',
        });

      doc.roundedRect(415, 200, 90, 30, 8).fillAndStroke('#e6fcda', '#b2f28c');
      doc
        .fontSize(12)
        .fillColor('#4ca61a')
        .text('PAID', 415, 210, { width: 90, align: 'center' });

      doc
        .fontSize(10)
        .fillColor('#aaa')
        .text(`Ticket ID: ${ticket.id}`, 390, 330, {
          width: 140,
          align: 'center',
        });

      doc.end();
    } catch (error) {
      console.error('PDF error:', error);
      doc.end();
    }
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

  async getParticipantsForSystem(eventId: number): Promise<User[]> {
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
}
