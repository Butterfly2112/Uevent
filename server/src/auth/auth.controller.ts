import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

/**
 * Поки що реальних запитів тут немає, я просто перевіряю
 * чи я правильно налаштувала всі існуючі на даний момент сервіси
 * та Swagger з Базою Даних
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Registers new user ordinary way',
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);

    return {
      message: 'Registered successfully',
    };
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get Profile',
    description: 'Returns information about current user',
  })
  getProfile() {
    return 'Profile info';
  }
}
