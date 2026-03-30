import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtType } from 'src/auth/types/jwtType.type';
import { AuthService } from 'src/auth/auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UserDetailedInfo } from './types/userDetailedInfo.type';
import { UpdateUserDto, UpdateUserDtoD } from './dto/updateUser.dto';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { UploadService } from 'src/upload/upload.service';
import { AuthGuard } from 'src/common/auth.guard';
import { AvatarUploadInterceptor } from 'src/upload/upload.interceptor';
import { toUserResponse } from 'src/common/mappers/user.mapper';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private uploadService: UploadService,
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

  @ApiOperation({
    summary: 'Update user information',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @ApiBody({
    type: UpdateUserDtoD,
  })
  @ApiBearerAuth()
  @ApiForbiddenResponse({
    description:
      'Only admin or owner can update user info.' +
      'Only admins can change role. Only owner can change email and username' +
      'Both can change user avatar',
  })
  @ApiConflictResponse({
    description: 'This email is already occupied',
  })
  @ApiNotFoundResponse({
    description: 'User was not found',
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(AvatarUploadInterceptor)
  async updateUser(
    @Param('id') param: number,
    @Body() dto: UpdateUserDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatar_url = file
      ? this.uploadService.getFileUrl('avatars', file.filename)
      : undefined;

    const user = await this.usersService.updateUser(
      { ...dto, avatar_url },
      param,
      req.user.id,
      req.user.role,
    );

    if (user && dto.email) this.authService.resetEmailToken(user);

    return toUserResponse(user);
  }
}
