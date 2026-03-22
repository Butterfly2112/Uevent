import { Controller, Get, Headers, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtType } from 'src/auth/types/jwtType.type';
import { AuthService } from 'src/auth/auth.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UserDetailedInfo } from './types/userDetailedInfo.type';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Get user details',
    description:
      'Get ALL details about users. Results will be shown differently depending on which permissions current user has.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved user information',
    type: UserDetailedInfo,
  })
  @ApiNotFoundResponse({
    description: 'User is not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: Number,
    example: 1,
  })
  @Get(':id')
  async getUserDetailedProfile(
    @Param('id') param: number,
    @Headers('authorization') authHeader?: string,
  ) {
    let user: JwtType | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      user = await this.authService.getUserFromToken(authHeader);
    }

    return await this.usersService.getUserByIdDetailed(
      param,
      user ? user.id : null,
    );
  }
}
