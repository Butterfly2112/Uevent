import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyNews } from './company-news.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.company)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column()
  email_for_info: string;

  @Column({ default: 'not given' })
  location: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  picture_url: string;

  @OneToMany(() => Event, (event) => event.company)
  events: Event[];

  @OneToMany(() => CompanyNews, (news) => news.company)
  news: CompanyNews[];

  @CreateDateColumn()
  created_at: Date;
}
