import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserDetailedInfo } from './types/userDetailedInfo.type';
import { toUserDetailedInfo } from 'src/common/mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    login: string,
    username: string,
    password: string,
    email: string,
  ): Promise<User> {
    const { loginExists, emailExists } = await this.checkUniqueness(
      login,
      email,
    );

    if (loginExists) {
      throw new ConflictException('This login is already being used.');
    }
    if (emailExists) {
      throw new ConflictException('This email is already being used.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      login,
      username,
      email,
      password_hash: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  async checkUniqueness(
    login: string,
    email: string,
  ): Promise<{ loginExists: boolean; emailExists: boolean }> {
    const existingUsers = await this.usersRepository.find({
      where: [{ login: login }, { email: email }],
      select: ['login', 'email'],
    });

    return {
      loginExists: existingUsers.some((u) => u.login === login),
      emailExists: existingUsers.some((u) => u.email === email),
    };
  }

  async checkPassword(
    guessPassword: string,
    realPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(guessPassword, realPassword);
  }

  async confirmEmail(userId: number) {
    await this.usersRepository.update(userId, { is_email_verified: true });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Returns detailed user information. Information returned depends on the permissions that are being assigned depending on the permissions (guest/user/owner/admin)
   * @param userId User id of which you are searching
   * @param currentUserId Current user id who is searching
   * @returns detailed user info
   */
  async getUserByIdDetailed(
    userId: number,
    currentUserId: number | null,
  ): Promise<UserDetailedInfo> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        company: {
          owner: true,
          events: true,
          news: true,
        },
        notifications: true,
        followers: true,
        following: true,
        hosted_events: true,
        tickets: {
          event: true,
          promo_code: true,
          user: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let owner = false;
    let admin = false;

    if (currentUserId) {
      const currentUser = await this.usersRepository.findOne({
        where: { id: currentUserId },
        select: ['id', 'role'],
      });
      if (currentUser) {
        owner = user.id === currentUser.id;
        admin = currentUser.role === 'admin';
      }
    }
    return toUserDetailedInfo(user, { owner, admin });
  }

  async userHasCompany(userId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { company: true },
    });
    return user?.company ? true : false;
  }
}
