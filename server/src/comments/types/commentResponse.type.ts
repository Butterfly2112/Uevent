import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from 'src/users/types/userResponse.type';

export class CommentResponse {
  @ApiProperty({ description: 'Unique identifier of the comment', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Identifier of the event this comment was left on',
    example: 3,
  })
  event_id: number;

  @ApiProperty({
    description: 'Author of comment',
  })
  author: UserResponse;

  @ApiProperty({
    description: 'Parent comment this one is replying to, null if top-level',
    nullable: true,
  })
  parent: CommentResponse | null;

  @ApiProperty({
    description: 'Replies to this comment',
    type: () => [CommentResponse],
  })
  children: CommentResponse[];

  @ApiProperty({
    description: 'Text content of the comment',
    example: 'There is some evil in this residence',
  })
  content: string;

  @ApiProperty({ description: 'Date when the comment was created' })
  created_at: Date;
}
