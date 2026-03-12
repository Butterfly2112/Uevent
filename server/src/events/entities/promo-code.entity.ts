import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('promo-codes')
export class PromoCode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.promo_codes)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  code: string;

  @Column()
  discount_percentage: number;

  @Column()
  expires_at: Date;
}
