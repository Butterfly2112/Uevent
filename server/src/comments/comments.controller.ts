import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { type RequestWithUser } from 'src/common/interfaces/request-with-user.type';
import { CreateCommentDto } from './dto/createComment.dto';
import { AuthGuard } from 'src/common/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CommentResponse } from './types/commentResponse.type';
import { UpdateCommentDto } from './dto/updateComment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentsService) {}

  @ApiOperation({
    summary: 'Create comment',
    description: 'Maximum comment depth reached (3 levels)',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'eventId',
    type: Number,
    description: 'Id of the event',
  })
  @ApiBody({
    type: CreateCommentDto,
  })
  @ApiCreatedResponse({
    description: 'Comment created successfully',
    type: CommentResponse,
  })
  @ApiNotFoundResponse({
    description:
      'Event not found or not available to the user yet. Parent comment not found',
  })
  @ApiBadRequestResponse({
    description:
      'The parent comment you try to comment does not belong to this event. Maximum comment depth reached (3 levels)',
  })
  @Post(':eventId/create')
  @UseGuards(AuthGuard)
  async createComment(
    @Param('eventId') eventId: number,
    @Req() req: RequestWithUser,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.createComment(
      req.user.id,
      req.user.role,
      eventId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Update comment',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Comment id',
  })
  @ApiBody({
    type: UpdateCommentDto,
  })
  @ApiNotFoundResponse({
    description: 'Comment not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner can update comment',
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('id') param: number,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(req.user.id, param, dto);
  }

  @ApiOperation({
    summary: 'Delete comment',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Comment id' })
  @ApiOkResponse({
    description: 'Comment deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Comment not found',
  })
  @ApiForbiddenResponse({
    description: 'Only owner and admin can delete comment',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('id') param: number, @Req() req: RequestWithUser) {
    await this.commentService.deleteComment(req.user.id, req.user.role, param);
    return {
      message: 'Comment deleted successfully',
    };
  }
}
