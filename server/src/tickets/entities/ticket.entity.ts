import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { PromoCode } from 'src/events/entities/promo-code.entity';

export enum TicketStatus {
  PAID = 'Paid',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: true })
  user_is_visible_to_public: boolean;

  @ManyToOne(() => PromoCode, { nullable: true, eager: false })
  @JoinColumn({ name: 'promo_code_id' })
  promo_code: PromoCode;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_paid: number;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING })
  status: TicketStatus;
}
