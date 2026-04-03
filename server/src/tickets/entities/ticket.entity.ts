import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { PromoCode } from 'src/events/entities/promo-code.entity';

export enum TicketStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => PromoCode, { nullable: true })
  @JoinColumn({ name: 'promo_code_id' })
  promo_code?: PromoCode;

  @Column({ type: 'decimal' })
  price_paid: number;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status: TicketStatus;

  @Column({ default: true })
  user_is_visible_to_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  payment_intent_id?: string;
}
