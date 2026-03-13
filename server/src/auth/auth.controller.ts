import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './auth.guard';
import { User } from 'src/users/entities/user.entity';
import { UserResponse } from 'src/users/types/userResponse.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get Profile',
    description: 'Returns information about current user',
  })
  @UseGuards(AuthGuard)
  async getProfile() {
    return 'Profile info';
  }

  /*  Поки що не потрібно
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
  }*/
}
