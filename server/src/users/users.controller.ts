import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtType } from 'src/auth/types/jwtType.type';
import { AuthService } from 'src/auth/auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserDetailedInfo } from './types/userDetailedInfo.type';
import { UpdateUserDto, UpdateUserDtoD } from './dto/updateUser.dto';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { UploadService } from 'src/upload/upload.service';
import { AuthGuard } from 'src/common/auth.guard';
import { AvatarUploadInterceptor } from 'src/upload/upload.interceptor';
import { toUserResponse } from 'src/common/mappers/user.mapper';
import {
  FollowersResponseDto,
  FollowingResponseDto,
} from './types/followResponse.type.dto';
import { SearchUserDto } from './dto/searchUser.dto';
import {
  UserForAdminResponse,
  UsersForAdminResponse,
} from './types/userForAdmin.type';
import { EventResponse } from 'src/events/types/eventResponse.type';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private uploadService: UploadService,
  ) {}

  @ApiOperation({
    summary: 'Follow the user',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of the user',
  })
  @ApiOkResponse({
    description: 'Followed user successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description:
      'You cannot follow yourself or You are already following this user',
  })
  @Post('follow/:id')
  @UseGuards(AuthGuard)
  async followUser(@Req() req: RequestWithUser, @Param('id') param: number) {
    await this.usersService.followUser(param, req.user.id);
    return {
      message: 'Followed user successfully',
    };
  }

  @ApiOperation({
    summary: 'Unfollow the user',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of the user',
  })
  @ApiOkResponse({
    description: 'Unfollowed user successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description:
      'You cannot unfollow yourself or You are not following this user in the first place',
  })
  @Post('unfollow/:id')
  @UseGuards(AuthGuard)
  async unfollowUser(@Req() req: RequestWithUser, @Param('id') param: number) {
    await this.usersService.unfollowUser(param, req.user.id);
    return {
      message: 'Unfollowed user successfully',
    };
  }

  @ApiOperation({
    summary: 'Get user followers',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: FollowersResponseDto,
  })
  @Get('followers')
  @UseGuards(AuthGuard)
  async getUserFollowers(@Req() req: RequestWithUser) {
    return await this.usersService.getFollowers(req.user.id);
  }

  @ApiOperation({
    summary: 'Get user following',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: FollowingResponseDto,
  })
  @Get('following')
  @UseGuards(AuthGuard)
  async getFollowing(@Req() req: RequestWithUser) {
    return await this.usersService.getFollowing(req.user.id);
  }

  @ApiOperation({
    summary: 'Search for users',
    description:
      'Allows admin to search for users using id or part of login, name, or email. ' +
      'If you use id for search than only user with exact id will be returned and' +
      'property search will be ignored completely',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UsersForAdminResponse,
  })
  @ApiForbiddenResponse({ description: 'Only admin can use users search' })
  @ApiNotFoundResponse({ description: 'User with such id not found' })
  @Get('search')
  @UseGuards(AuthGuard)
  async searchUsers(@Req() req: RequestWithUser, @Query() dto: SearchUserDto) {
    return await this.usersService.searchUsers(req.user.role, dto);
  }

  @ApiOperation({
    summary: 'Get all events user following',
  })
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiOkResponse({
    description: 'Events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: { $ref: getSchemaPath(EventResponse) },
        },
        total: { type: 'number', example: 1 },
      },
    },
  })
  @Get('following-events')
  @UseGuards(AuthGuard)
  async getUserFollowingEvents(@Req() req: RequestWithUser) {
    return await this.usersService.getUserFollowingEvents(req.user.id);
  }

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

  @ApiOperation({
    summary: 'Delete user',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: Number,
  })
  @ApiForbiddenResponse({
    description: 'Only owner or admin can delete user',
  })
  @ApiNotFoundResponse({
    description: 'User with such id not found',
  })
  @ApiOkResponse({
    description: 'User was deleted successfully',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUserById(
    @Req() req: RequestWithUser,
    @Param('id') param: number,
  ) {
    await this.usersService.deleteUserById(req.user.id, req.user.role, param);
    return {
      message: 'Deleted user successfuly',
    };
  }
}
