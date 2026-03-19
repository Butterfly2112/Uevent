import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export type NotificationType =
  | 'event_news'
  | 'new_event'
  | 'company_new_user'
  | 'event_comment'
  | 'comment_reply'
  | 'ticket_purchase'
  | 'event_reminder'
  | 'payment_success';

export type EmailStatus = 'pending' | 'sent' | 'failed';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: [
      'event_news',
      'new_event',
      'company_new_user',
      'event_comment',
      'comment_reply',
      'ticket_purchase',
      'event_reminder',
      'payment_success',
    ],
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ default: false })
  send_email: boolean;

  @Column({ type: 'enum', enum: ['pending', 'sent', 'failed'], nullable: true })
  email_status: EmailStatus | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
