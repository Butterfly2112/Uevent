import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  /**
   * Тимчасова імітація реєстрації
   * @param registerDto
   */
  async register(registerDto: RegisterDto): Promise<void> {
    return;
  }
}
