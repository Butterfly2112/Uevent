import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
  })
  @MaxLength(250, {
    message: 'Comment content cannot be longer than 250 characters',
  })
  content: string;
}
