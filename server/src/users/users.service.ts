import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

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
}
