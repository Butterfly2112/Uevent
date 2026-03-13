import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async register(registerDto: RegisterDto): Promise<void> {
    const { login, username, password, email } = registerDto;

    const emailTokenToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create(
      login,
      username,
      password,
      email,
    );

    const emailToken = await this.tokenRepository.save({
      type: 'emailChange',
      token: emailTokenToken,
      user: user,
    });

    this.emailService
      .sendEmailConfirmation(username, email, emailTokenToken)
      .catch((err) => {
        console.log('Failed to send email: ', err);
      });
  }

  async confirmEmail(token: string): Promise<void> {
    const emailToken = await this.tokenRepository.findOne({
      where: { token: token },
      select: { user: { id: true, is_email_verified: true } },
      relations: { user: true },
    });

    if (!emailToken) {
      throw new NotFoundException('Email already confirmed or invalid token');
    }

    await this.usersService.confirmEmail(emailToken.user.id);
    await this.tokenRepository.delete(emailToken.id);
  }
}
