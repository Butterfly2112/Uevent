import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Token } from 'src/auth/entities/token.entity';
import { Event } from 'src/events/entities/event.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Notification } from 'src/notifications/entities/notifications.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'default' })
  avatar_url: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: true, unique: true })
  google_id: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Column({ default: false })
  is_email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Event, (event) => event.host)
  hosted_events: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToOne(() => Company, (company) => company.owner)
  company: Company;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'subscriptions',
    joinColumn: { name: 'subscriber_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subscribed_to_id', referencedColumnName: 'id' },
  })
  following: User[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];
}
