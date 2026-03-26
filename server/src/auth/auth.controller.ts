import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '../common/auth.guard';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { LoginResponseDto } from './dto/loginResponse.dto';

import { UsersService } from 'src/users/users.service';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    // Inject UsersService for profile endpoint
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiCreatedResponse({
    description: 'Registered user successfully. Please confirm your email box.',
  })
  @ApiConflictResponse({
    description: 'Login or email already being used',
  })
  @ApiBadRequestResponse({
    description: "Requirements to the request body wasn't met",
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);

    return {
      message: 'Registered user successfully. Please confirm your email box.',
    };
  }

  @ApiOperation({
    summary: 'Confirm email of the user',
  })
  @ApiOkResponse({
    description: 'Email confirmed successfully',
  })
  @ApiNotFoundResponse({
    description: 'Email already confirmed or token is invalid',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    type: String,
    description: 'Email token to confirm user email',
  })
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    await this.authService.confirmEmail(token);

    return {
      message: 'Email confirmed successfully',
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiForbiddenResponse({
    description:
      'Email is not validated yet. Please check your email or post request to resend verification letter again.',
  })
  @ApiBadRequestResponse({
    description: 'Wrong password or user with such login/email does not exists',
  })
  @ApiOkResponse({
    description: 'Logged in successfully',
    type: LoginResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Logged in successfully',
      access_token,
      user,
    };
  }

  @ApiOperation({
    summary: 'Refresh user authorization',
    description:
      "If user's access token has expired, try refreshing it using this request",
  })
  @ApiOkResponse({
    description: 'Successfully refreshed authorization',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1Ni...',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Invalid token or Refresh token expired',
  })
  @ApiNotFoundResponse({
    description: 'Refresh token not found in database',
  })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const { accessToken, refreshJwtToken } =
      await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', refreshJwtToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
    });

    return {
      access_token: accessToken,
    };
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get Profile (Minimal information)',
    description: 'Returns information about current user',
  })
  @UseGuards(AuthGuard)
  // Changed: Now returns user with company relation for frontend profile
  async getProfile(@Req() req: RequestWithUser) {
    // Fetch user with company relation for profile page
    return this.usersService.getUserByIdDetailed(req.user.id, req.user.id);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'User logout by deleting refresh token',
  })
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }
}
