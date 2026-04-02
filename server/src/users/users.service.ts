import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserDetailedInfo } from './types/userDetailedInfo.type';
import {
  mapUserForAdmin,
  toUserDetailedInfo,
  toUserResponse,
} from 'src/common/mappers/user.mapper';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UploadService } from 'src/upload/upload.service';
import {
  FollowersResponseDto,
  FollowingResponseDto,
} from './types/followResponse.type.dto';
import { SearchUserDto } from './dto/searchUser.dto';
import { UserForAdminResponse } from './types/userForAdmin.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private uploadService: UploadService,
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

  async resetPassword(newPassword: string, userId: number): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(userId, { password_hash: password_hash });
  }

  async updateUser(
    dto: UpdateUserDto,
    userId: number,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<User> {
    if (
      (userId !== currentUserId && currentUserRole !== 'admin') ||
      (currentUserRole != 'admin' && dto.role) ||
      (currentUserId != userId && (dto.email || dto.username))
    ) {
      if (dto.avatar_url) this.uploadService.deleteByUrl(dto.avatar_url);
      if (userId !== currentUserId && currentUserRole !== 'admin')
        throw new ForbiddenException(
          'Only owner or admin can change account details',
        );
      if (currentUserRole != 'admin' && dto.role)
        throw new ForbiddenException('Only admin can change users role');
      if (currentUserId != userId && (dto.email || dto.username))
        throw new ForbiddenException(
          'Admin allowed to change only users role and avatar',
        );
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      if (dto.avatar_url) this.uploadService.deleteByUrl(dto.avatar_url);
      throw new NotFoundException('User not found');
    }
    if (dto.avatar_url && user.avatar_url) {
      this.uploadService.deleteByUrl(user.avatar_url);
    }
    if (dto.email) {
      const already_exists = await this.usersRepository.findOne({
        where: { email: dto.email },
        select: { id: true },
      });
      if (already_exists && user.id !== already_exists.id) {
        if (dto.avatar_url) this.uploadService.deleteByUrl(dto.avatar_url);
        throw new ConflictException('This email already occupied');
      }
      user.is_email_verified = false;
    }

    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined),
    );

    Object.assign(user, updateData);

    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async followUser(userId: number, currentUserId: number): Promise<void> {
    if (userId === currentUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'following')
      .of(currentUserId)
      .loadMany();
    const alreadyFollowing = isFollowing.some((u) => u.id === userId);

    if (alreadyFollowing) {
      throw new BadRequestException('You are already following this user');
    }

    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'following')
      .of(currentUserId)
      .add(userId);
  }

  async unfollowUser(userId: number, currentUserId: number): Promise<void> {
    if (userId === currentUserId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'following')
      .of(currentUserId)
      .loadMany();
    const alreadyFollowing = isFollowing.some((u) => u.id === userId);

    if (!alreadyFollowing) {
      throw new BadRequestException('You are not following this user');
    }

    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'following')
      .of(currentUserId)
      .remove(userId);
  }

  async getFollowers(userId: number): Promise<FollowersResponseDto> {
    const [followers, followers_count] =
      await this.usersRepository.findAndCountBy({ following: { id: userId } });
    return {
      followers: followers.map(toUserResponse),
      followers_count,
    };
  }

  async getFollowing(userId: number): Promise<FollowingResponseDto> {
    const [following, following_count] =
      await this.usersRepository.findAndCountBy({
        followers: { id: userId },
      });

    return { following: following.map(toUserResponse), following_count };
  }

  async getUserForService(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async searchUsers(
    currentUserRole: string,
    dto: SearchUserDto,
  ): Promise<{ users: UserForAdminResponse[] | []; total: number }> {
    if (currentUserRole !== 'admin')
      throw new ForbiddenException('Only admin allowed to perform such action');

    if (dto.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) throw new NotFoundException('User with this id not found');
      return { users: [mapUserForAdmin(user)], total: 1 };
    }

    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .andWhere(
        '(user.login ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search)',
        {
          search: `%${dto.search}%`,
        },
      )
      .getManyAndCount();

    return { users: users.map(mapUserForAdmin), total };
  }
}
