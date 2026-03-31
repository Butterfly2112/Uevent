import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './userResponse.type';

export class FollowersResponseDto {
  @ApiProperty({
    description: 'Followers of the user',
  })
  followers: UserResponse[] | [];

  @ApiProperty({
    description: 'Number of the followers',
  })
  followers_count: number;
}

export class FollowingResponseDto {
  @ApiProperty({
    description: 'Following of the user',
  })
  following: UserResponse[] | [];

  @ApiProperty({
    description: 'Number of the following',
  })
  following_count: number;
}
