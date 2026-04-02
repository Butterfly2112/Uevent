import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchUserDto {
  @ApiProperty({
    description:
      'Id of the user you are searching for. If you use this property than' +
      ' anything that goes to search is not being used and user is being found ONLY by exect id',
    example: 1,
    required: false,
  })
  @IsOptional()
  userId?: number;

  @ApiProperty({
    description: 'part of user login/username/email',
    example: 'mosquito',
    required: false,
  })
  @IsOptional()
  search?: string;
}
