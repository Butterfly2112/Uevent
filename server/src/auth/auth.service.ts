import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { LessThan, Repository } from 'typeorm';
import crypto from 'crypto';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './types/authResponse.type';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { UserResponse } from 'src/users/types/userResponse.type';
import { JwtType } from './types/jwtType.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByLoginOrEmail(
      loginDto.loginOrEmail,
    );

    if (!user) {
      throw new BadRequestException(
        'Wrong password or user with such login/email does not exists',
      );
    }

    const isPasswordValid = await this.usersService.checkPassword(
      loginDto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(
        'Wrong password or user with such login/email does not exists',
      );
    }

    if (!user.is_email_verified) {
      throw new ForbiddenException(
        'Email is not validated yet. Please check your email or post request to resend verification letter again.',
      );
    }

    const { accessToken, refreshJwtToken } = await this.generateJwtTokens(user);

    await this.saveNewRefreshToken(user, refreshJwtToken);

    return {
      access_token: accessToken,
      refresh_token: refreshJwtToken,
      user: await this.safeUserResponse(user),
    };
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

  private async generateJwtTokens(user: {
    id: number;
    login: string;
    username: string;
    email: string;
    role: string;
  }): Promise<{ accessToken: string; refreshJwtToken: string }> {
    const payload = {
      id: user.id,
      login: user.login,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    const refreshJwtToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    return { accessToken, refreshJwtToken };
  }

  private async removeExpiredJwtTokens(userId: number): Promise<void> {
    await this.tokenRepository.delete({
      user: { id: userId },
      type: 'refreshJwtToken',
      expires_at: LessThan(new Date()),
    });
  }

  private async saveNewRefreshToken(
    user: User,
    refreshJwtToken: string,
  ): Promise<void> {
    await this.removeExpiredJwtTokens(user.id);

    await this.tokenRepository.save({
      token: refreshJwtToken,
      type: 'refreshJwtToken',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: user,
    });
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshJwtToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (!decoded) {
        throw new ConflictException('Invalid token');
      }

      const storedToken = await this.tokenRepository.findOne({
        where: { token: refreshToken },
        select: { user: true },
        relations: { user: true },
      });

      if (!storedToken) {
        throw new NotFoundException('Refresh token not found in database');
      }

      if (storedToken.expires_at < new Date()) {
        throw new ConflictException('Refresh token expired');
      }

      const user = storedToken.user;
      const { accessToken, refreshJwtToken } =
        await this.generateJwtTokens(user);

      await this.tokenRepository.delete(storedToken);
      await this.saveNewRefreshToken(user, refreshJwtToken);

      return {
        accessToken,
        refreshJwtToken,
      };
    } catch (error) {
      throw new ConflictException(`Invalid refresh token: ${error.message}`);
    }
  }

  async safeUserResponse(user: User): Promise<UserResponse> {
    return {
      id: user.id,
      login: user.login,
      username: user.username,
      email: user.email,
      emailValidated: user.is_email_verified,
      avatar_url: user.avatar_url,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async logout(token: string): Promise<void> {
    await this.tokenRepository.delete({ token: token });
  }

  async getUserFromToken(authHeader: string): Promise<JwtType | null> {
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user: JwtType = payload;
      return user;
    } catch (e) {
      return null;
    }
  }
}
