import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { User } from './users/entities/user.entity';
import { Comment } from './comments/entities/comment.entity';
import { Company } from './companies/entities/company.entity';
import { CompanyNews } from './companies/entities/company-news.entity';
import {
  Event,
  EventFormat,
  EventStatus,
  EventTheme,
} from './events/entities/event.entity';
import { PromoCode } from './events/entities/promo-code.entity';
import { Ticket, TicketStatus } from './tickets/entities/ticket.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(CompanyNews)
    private companyNewsRepository: Repository<CompanyNews>,
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepository.count();
    if (count > 0) return;

    console.log('Database is empty. Starting seeding process...');

    const passwordHash = await bcrypt.hash('Password1', 10);

    const userData = [
      {
        login: 'admin',
        username: 'Admin',
        email: 'admin@uevent.com',
        role: 'admin' as const,
      },
      { login: 'alice_dev', username: 'Alice Dev', email: 'alice@example.com' },
      { login: 'bob_music', username: 'Bob Music', email: 'bob@example.com' },
      { login: 'carol_art', username: 'Carol Art', email: 'carol@example.com' },
      { login: 'dan_tech', username: 'Dan Tech', email: 'dan@example.com' },
      { login: 'eva_biz', username: 'Eva Biz', email: 'eva@example.com' },
      {
        login: 'frank_poet',
        username: 'Frank Poet',
        email: 'frank@example.com',
      },
      {
        login: 'grace_photo',
        username: 'Grace Photo',
        email: 'grace@example.com',
      },
      {
        login: 'hank_sport',
        username: 'Hank Sport',
        email: 'hank@example.com',
      },
      { login: 'iris_food', username: 'Iris Food', email: 'iris@example.com' },
      { login: 'jack_film', username: 'Jack Film', email: 'jack@example.com' },
      { login: 'kate_yoga', username: 'Kate Yoga', email: 'kate@example.com' },
      { login: 'leo_code', username: 'Leo Code', email: 'leo@example.com' },
      { login: 'mia_dance', username: 'Mia Dance', email: 'mia@example.com' },
      {
        login: 'nick_travel',
        username: 'Nick Travel',
        email: 'nick@example.com',
      },
      {
        login: 'olivia_sci',
        username: 'Olivia Sci',
        email: 'olivia@example.com',
      },
    ];

    const users = await this.userRepository.save(
      userData.map((u) =>
        this.userRepository.create({
          ...u,
          password_hash: passwordHash,
          is_email_verified: true,
          role: u.role ?? 'user',
        }),
      ),
    );

    const companyData = [
      {
        owner: users[1],
        name: 'TechWave Inc.',
        email_for_info: 'info@techwave.com',
        location: 'Kyiv, Ukraine',
        description: 'Leading tech events organizer in Ukraine.',
      },
      {
        owner: users[2],
        name: 'MelodyBox Events',
        email_for_info: 'hello@melodybox.com',
        location: 'Lviv, Ukraine',
        description: 'Music festivals and concerts across Europe.',
      },
      {
        owner: users[3],
        name: 'ArtSpace Agency',
        email_for_info: 'art@artspace.ua',
        location: 'Odesa, Ukraine',
        description: 'Gallery openings, exhibitions and art fairs.',
      },
      {
        owner: users[4],
        name: 'BizConnect Group',
        email_for_info: 'biz@bizconnect.ua',
        location: 'Dnipro, Ukraine',
        description: 'Business networking and corporate conferences.',
      },
      {
        owner: users[5],
        name: 'MindGrow Workshops',
        email_for_info: 'grow@mindgrow.com',
        location: 'Kharkiv, Ukraine',
        description: 'Personal development and psychology workshops.',
      },
    ];

    const companies = await this.companyRepository.save(
      companyData.map((c) => this.companyRepository.create(c)),
    );

    const newsData = [
      {
        company: companies[0],
        title: 'TechWave Hackathon 2026 announced',
        content:
          'We are thrilled to announce our annual hackathon taking place in July 2026. Register now!',
      },
      {
        company: companies[0],
        title: 'New partnership with GlobalTech',
        content:
          'TechWave has partnered with GlobalTech to bring world-class speakers to our events.',
      },
      {
        company: companies[0],
        title: 'Early bird tickets now available',
        content:
          'Grab your early bird tickets for TechConf 2026 before they sell out!',
      },
      {
        company: companies[1],
        title: 'Summer Festival lineup revealed',
        content:
          'We are happy to announce the full lineup for MelodyFest 2026. Headliners include 20+ artists.',
      },
      {
        company: companies[1],
        title: 'MelodyBox turns 5 years old!',
        content:
          'Five years of amazing music events — thank you to all our fans and partners!',
      },
      {
        company: companies[1],
        title: 'New stage added to MelodyFest',
        content:
          'This year MelodyFest will feature a brand new acoustic stage for intimate performances.',
      },
      {
        company: companies[2],
        title: 'Urban Art Exhibition coming to Odesa',
        content:
          'World-class urban artists will showcase their work in our upcoming open-air exhibition.',
      },
      {
        company: companies[2],
        title: 'Call for local artists',
        content:
          'We are looking for local talents to participate in our spring gallery opening. Apply now!',
      },
      {
        company: companies[2],
        title: 'Photography workshop sold out',
        content:
          'Our monthly photography workshop sold out in under 24 hours. Next session announced soon.',
      },
      {
        company: companies[3],
        title: 'BizConnect Annual Summit 2026',
        content:
          'Register for our flagship business summit — 3 days of networking, panels and workshops.',
      },
      {
        company: companies[3],
        title: 'Startup pitch competition open',
        content:
          'Startups can now apply to pitch at BizConnect Summit. Cash prizes and investor meetings await.',
      },
      {
        company: companies[3],
        title: 'New mentorship program launched',
        content:
          'We are launching a free mentorship program connecting entrepreneurs with industry leaders.',
      },
      {
        company: companies[4],
        title: 'Mindfulness retreat in the Carpathians',
        content:
          'Join us for a weekend mindfulness retreat in the mountains — limited spots available.',
      },
      {
        company: companies[4],
        title: 'Online workshop schedule for Q2',
        content:
          'Check out our full schedule of online personal development workshops for spring 2026.',
      },
      {
        company: companies[4],
        title: 'New facilitator joins MindGrow',
        content:
          'We welcome Dr. Iryna Bondar as our newest certified mindfulness facilitator.',
      },
    ];

    await this.companyNewsRepository.save(
      newsData.map((n) => this.companyNewsRepository.create(n)),
    );

    const now = new Date();
    const past = (days: number) => new Date(now.getTime() - days * 86400000);
    const future = (days: number) => new Date(now.getTime() + days * 86400000);

    const eventsData = [
      {
        company: companies[0],
        host: users[1],
        title: 'TechConf Ukraine 2026',
        description:
          'The biggest tech conference in Ukraine. Three days of talks, workshops and networking.',
        price: 500,
        ticket_limit: 200,
        address: 'Kyiv, Olimpiyskiy Stadium',
        start_date: future(30),
        end_date: future(33),
        publish_date: past(1),
        status: EventStatus.PLANNED,
        format: EventFormat.CONFERENCE,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[0],
        host: users[1],
        title: 'React & TypeScript Workshop',
        description:
          'Hands-on workshop for frontend developers — from beginner to advanced.',
        price: 200,
        ticket_limit: 50,
        address: 'Kyiv, IT Hub',
        start_date: future(10),
        end_date: future(10),
        publish_date: past(5),
        status: EventStatus.ACTIVE,
        format: EventFormat.WORKSHOP,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[0],
        host: users[1],
        title: 'AI & ML Meetup',
        description:
          'Monthly meetup for machine learning enthusiasts and professionals.',
        price: 0,
        ticket_limit: 100,
        address: 'Kyiv, Chasopys Hub',
        start_date: future(7),
        end_date: future(7),
        publish_date: past(2),
        status: EventStatus.PLANNED,
        format: EventFormat.LECTURE,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[1],
        host: users[2],
        title: 'MelodyFest 2026',
        description:
          'Three-day open-air music festival featuring 30+ artists from around the world.',
        price: 1200,
        ticket_limit: 5000,
        address: 'Lviv, Lychakiv Park',
        start_date: future(60),
        end_date: future(62),
        publish_date: past(10),
        status: EventStatus.PLANNED,
        format: EventFormat.FEST,
        theme: EventTheme.FANMEETING,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[1],
        host: users[2],
        title: 'Jazz in the Park',
        description:
          'An intimate evening of live jazz music under the open sky.',
        price: 350,
        ticket_limit: 300,
        address: 'Lviv, Stryiskyi Park',
        start_date: future(20),
        end_date: future(20),
        publish_date: past(3),
        status: EventStatus.ACTIVE,
        format: EventFormat.CONCERT,
        theme: EventTheme.FANMEETING,
        visitor_visibility: 'attendees_only' as const,
      },
      {
        company: companies[1],
        host: users[2],
        title: 'Electronic Night Vol. 3',
        description:
          'Underground electronic music night with resident and guest DJs.',
        price: 400,
        ticket_limit: 400,
        address: 'Kyiv, Atlas Club',
        start_date: future(14),
        end_date: future(14),
        publish_date: past(7),
        status: EventStatus.ACTIVE,
        format: EventFormat.CONCERT,
        theme: EventTheme.FANMEETING,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[2],
        host: users[3],
        title: 'Urban Art Exhibition',
        description:
          'A curated exhibition of contemporary urban art from 15 Ukrainian artists.',
        price: 100,
        ticket_limit: 500,
        address: 'Odesa, Literaturna St. 10',
        start_date: future(15),
        end_date: future(30),
        publish_date: past(5),
        status: EventStatus.ACTIVE,
        format: EventFormat.CONFERENCE,
        theme: EventTheme.PSYCHOLOGY,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[2],
        host: users[3],
        title: 'Street Photography Walk',
        description:
          'Guided photography walk through the historic streets of Odesa.',
        price: 150,
        ticket_limit: 20,
        address: 'Odesa, Derybasivska St.',
        start_date: future(5),
        end_date: future(5),
        publish_date: past(1),
        status: EventStatus.PLANNED,
        format: EventFormat.WORKSHOP,
        theme: EventTheme.PSYCHOLOGY,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[3],
        host: users[4],
        title: 'BizConnect Annual Summit',
        description:
          'Flagship 3-day business summit with 50+ speakers and 1000+ attendees.',
        price: 2500,
        ticket_limit: 1000,
        address: 'Dnipro, Arena City',
        start_date: future(45),
        end_date: future(47),
        publish_date: past(14),
        status: EventStatus.PLANNED,
        format: EventFormat.CONFERENCE,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[3],
        host: users[4],
        title: 'Startup Pitch Night',
        description:
          'Startups pitch their ideas to a panel of investors and win funding.',
        price: 0,
        ticket_limit: 150,
        address: 'Dnipro, Coworking Space Hub',
        start_date: future(22),
        end_date: future(22),
        publish_date: past(6),
        status: EventStatus.ACTIVE,
        format: EventFormat.LECTURE,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[3],
        host: users[4],
        title: 'Leadership Masterclass',
        description:
          'Full-day masterclass on modern leadership techniques for executives.',
        price: 800,
        ticket_limit: 30,
        address: 'Dnipro, Business Center Renome',
        start_date: future(12),
        end_date: future(12),
        publish_date: past(3),
        status: EventStatus.PLANNED,
        format: EventFormat.WORKSHOP,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'attendees_only' as const,
      },
      {
        company: companies[4],
        host: users[5],
        title: 'Weekend Mindfulness Retreat',
        description:
          'Two days of meditation, yoga and nature walks in the Carpathian mountains.',
        price: 1800,
        ticket_limit: 25,
        address: 'Yaremche, Carpathians',
        start_date: future(35),
        end_date: future(36),
        publish_date: past(8),
        status: EventStatus.PLANNED,
        format: EventFormat.WORKSHOP,
        theme: EventTheme.PSYCHOLOGY,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[4],
        host: users[5],
        title: 'Stress Management Workshop',
        description:
          'Evidence-based techniques for managing stress in daily life.',
        price: 250,
        ticket_limit: 40,
        address: 'Kharkiv, MindSpace Center',
        start_date: future(8),
        end_date: future(8),
        publish_date: past(2),
        status: EventStatus.ACTIVE,
        format: EventFormat.WORKSHOP,
        theme: EventTheme.PSYCHOLOGY,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[4],
        host: users[5],
        title: 'Psychology of Success',
        description:
          'A lecture on the psychological foundations of high performance.',
        price: 180,
        ticket_limit: 80,
        address: 'Kharkiv, Cultural Center Yermilov',
        start_date: future(18),
        end_date: future(18),
        publish_date: past(4),
        status: EventStatus.PLANNED,
        format: EventFormat.LECTURE,
        theme: EventTheme.PSYCHOLOGY,
        visitor_visibility: 'everybody' as const,
      },
      {
        company: companies[0],
        host: users[1],
        title: 'DevOps Days Kyiv',
        description:
          'Two-day conference dedicated to DevOps practices and cloud infrastructure.',
        price: 600,
        ticket_limit: 250,
        address: 'Kyiv, IEC',
        start_date: future(50),
        end_date: future(51),
        publish_date: past(10),
        status: EventStatus.PLANNED,
        format: EventFormat.CONFERENCE,
        theme: EventTheme.BUSINESS,
        visitor_visibility: 'everybody' as const,
      },
    ];

    const events = await this.eventRepository.save(
      eventsData.map((e) => this.eventRepository.create(e)),
    );

    const promosData = [
      {
        event: events[0],
        code: 'TECH20',
        discount_percentage: 20,
        expires_at: future(25),
      },
      {
        event: events[0],
        code: 'EARLYBIRD',
        discount_percentage: 15,
        expires_at: future(15),
      },
      {
        event: events[1],
        code: 'REACT10',
        discount_percentage: 10,
        expires_at: future(8),
      },
      {
        event: events[3],
        code: 'FEST30',
        discount_percentage: 30,
        expires_at: future(50),
      },
      {
        event: events[3],
        code: 'VIP2026',
        discount_percentage: 25,
        expires_at: future(55),
      },
      {
        event: events[4],
        code: 'JAZZ15',
        discount_percentage: 15,
        expires_at: future(18),
      },
      {
        event: events[6],
        code: 'ART50',
        discount_percentage: 50,
        expires_at: future(12),
      },
      {
        event: events[8],
        code: 'BIZ25',
        discount_percentage: 25,
        expires_at: future(40),
      },
      {
        event: events[9],
        code: 'PITCH',
        discount_percentage: 100,
        expires_at: future(20),
      },
      {
        event: events[11],
        code: 'MIND20',
        discount_percentage: 20,
        expires_at: future(30),
      },
      {
        event: events[12],
        code: 'STRESS',
        discount_percentage: 10,
        expires_at: future(6),
      },
      {
        event: events[14],
        code: 'DEVOPS15',
        discount_percentage: 15,
        expires_at: future(45),
      },
      {
        event: events[5],
        code: 'NIGHT20',
        discount_percentage: 20,
        expires_at: future(10),
      },
      {
        event: events[10],
        code: 'LEAD50',
        discount_percentage: 50,
        expires_at: future(9),
      },
      {
        event: events[13],
        code: 'PSYCH25',
        discount_percentage: 25,
        expires_at: future(15),
      },
    ];

    await this.promoCodeRepository.save(
      promosData.map((p) => this.promoCodeRepository.create(p)),
    );

    const ticketsData = [
      {
        user: users[6],
        event: events[0],
        price_paid: 400,
        status: TicketStatus.PAID,
      },
      {
        user: users[7],
        event: events[0],
        price_paid: 500,
        status: TicketStatus.PAID,
      },
      {
        user: users[8],
        event: events[1],
        price_paid: 200,
        status: TicketStatus.PAID,
      },
      {
        user: users[9],
        event: events[1],
        price_paid: 180,
        status: TicketStatus.PAID,
      },
      {
        user: users[10],
        event: events[3],
        price_paid: 840,
        status: TicketStatus.PAID,
      },
      {
        user: users[11],
        event: events[3],
        price_paid: 1200,
        status: TicketStatus.PAID,
      },
      {
        user: users[12],
        event: events[4],
        price_paid: 350,
        status: TicketStatus.PAID,
      },
      {
        user: users[13],
        event: events[5],
        price_paid: 400,
        status: TicketStatus.PAID,
      },
      {
        user: users[14],
        event: events[6],
        price_paid: 100,
        status: TicketStatus.PAID,
      },
      {
        user: users[15],
        event: events[6],
        price_paid: 50,
        status: TicketStatus.PAID,
      },
      {
        user: users[6],
        event: events[8],
        price_paid: 1875,
        status: TicketStatus.PAID,
      },
      {
        user: users[7],
        event: events[9],
        price_paid: 0,
        status: TicketStatus.PAID,
      },
      {
        user: users[8],
        event: events[11],
        price_paid: 1440,
        status: TicketStatus.PAID,
      },
      {
        user: users[9],
        event: events[12],
        price_paid: 250,
        status: TicketStatus.PAID,
      },
      {
        user: users[10],
        event: events[13],
        price_paid: 180,
        status: TicketStatus.PAID,
      },
      {
        user: users[11],
        event: events[14],
        price_paid: 510,
        status: TicketStatus.PAID,
      },
    ];

    const tickets = await this.ticketRepository.save(
      ticketsData.map((t) =>
        this.ticketRepository.create({ ...t, user_is_visible_to_public: true }),
      ),
    );

    const commentsData = [
      {
        author: users[6],
        event: events[0],
        content: 'Cannot wait for TechConf! The speaker lineup looks amazing.',
      },
      {
        author: users[7],
        event: events[0],
        content: 'Will there be recorded sessions available afterwards?',
      },
      {
        author: users[8],
        event: events[1],
        content:
          'Is the React workshop suitable for someone with 6 months of experience?',
      },
      {
        author: users[9],
        event: events[3],
        content:
          'MelodyFest last year was incredible, can only imagine this one!',
      },
      {
        author: users[10],
        event: events[3],
        content: 'Are camping spots available near the venue?',
      },
      {
        author: users[11],
        event: events[4],
        content:
          'Jazz in the Park sounds like a perfect evening. Tickets booked!',
      },
      {
        author: users[12],
        event: events[6],
        content: 'The artists in this exhibition are truly talented.',
      },
      {
        author: users[13],
        event: events[8],
        content:
          'I have been to two previous BizConnect Summits — always worth it.',
      },
      {
        author: users[14],
        event: events[9],
        content:
          'Great initiative! Is there a specific sector focus for pitches this time?',
      },
      {
        author: users[15],
        event: events[11],
        content:
          'The Carpathian retreat was life-changing last year. Booking immediately!',
      },
      {
        author: users[6],
        event: events[12],
        content: 'Looking forward to practical stress management tools.',
      },
      {
        author: users[7],
        event: events[2],
        content:
          'Will there be a stream for those who cannot attend in person?',
      },
      {
        author: users[8],
        event: events[5],
        content: 'The electronic lineup looks fire! Who are the guest DJs?',
      },
      {
        author: users[9],
        event: events[10],
        content:
          'The Leadership Masterclass price seems very reasonable for a full day.',
      },
      {
        author: users[10],
        event: events[13],
        content:
          'Dr. Bondar is an amazing speaker — saw her at a previous event.',
      },
    ];

    const savedComments = await this.commentRepository.save(
      commentsData.map((c) =>
        this.commentRepository.create({ ...c, parent: null }),
      ),
    );

    const repliesData = [
      {
        author: users[1],
        event: events[0],
        content:
          'Yes! All sessions will be recorded and available for 30 days.',
        parent: savedComments[1],
      },
      {
        author: users[1],
        event: events[1],
        content: 'Absolutely! The workshop is designed for all levels.',
        parent: savedComments[2],
      },
      {
        author: users[2],
        event: events[3],
        content: 'Yes, camping zones open from Thursday evening!',
        parent: savedComments[4],
      },
      {
        author: users[5],
        event: events[11],
        content: 'Spots are filling fast — only 5 left!',
        parent: savedComments[9],
      },
      {
        author: users[4],
        event: events[9],
        content:
          'We welcome all tech and climate-focused startups this season.',
        parent: savedComments[13],
      },
    ];

    await this.commentRepository.save(
      repliesData.map((r) => this.commentRepository.create(r)),
    );

    console.log('✅ Seeding complete!');
    console.log(`   Users: ${users.length}`);
    console.log(`   Companies: ${companies.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Tickets: ${tickets.length}`);
  }
}
