import { Company } from 'src/companies/entities/company.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PromoCode } from './promo-code.entity';
import { Comment } from 'src/comments/entities/comment.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  ENDED = 'ended',
}
export enum EventFormat {
  CONFERENCE = 'Conference',
  LECTURE = 'Lecture',
  CONCERT = 'Concert',
  WORKSHOP = 'Workshop',
  FEST = 'Fest',
}
export enum EventTheme {
  BUSINESS = 'business',
  POLITICS = 'politics',
  PSYCHOLOGY = 'psychology',
  FANMEETING = 'fan meeting',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.events, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, (user) => user.hosted_events, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @Column({ default: true })
  notificate_owner: boolean;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  ticket_limit: number;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 'default' })
  poster_url: string;

  @Column({ nullable: true })
  redirect_url: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  publish_date: Date;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ type: 'enum', enum: EventFormat, nullable: true })
  format: EventFormat;

  @Column({ type: 'enum', enum: EventTheme, nullable: true })
  theme: EventTheme;

  @Column({ type: 'enum', enum: ['everybody', 'attendees_only'] })
  visitor_visibility: 'everybody' | 'attendees_only';

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];

  @OneToMany(() => PromoCode, (promo) => promo.event)
  promo_codes: PromoCode[];
}
