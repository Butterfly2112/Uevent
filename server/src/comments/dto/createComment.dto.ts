import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Id of the parrent comment',
    nullable: true,
  })
  @IsOptional()
  parentId: number | null;

  @ApiProperty({
    description: 'Content of the comment',
  })
  @MaxLength(250, {
    message: 'Comment content cannot be longer than 250 characters',
  })
  content: string;
}
