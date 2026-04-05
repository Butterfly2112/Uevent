import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventService } from 'src/events/events.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponse } from './types/commentResponse.type';
import { Comment } from './entities/comment.entity';
import { mapCommentToResponse } from 'src/common/mappers/comment.mapper';
import { checkVisibilityOfEvent } from 'src/common/mappers/event.mapper';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/types/notifications-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private eventService: EventService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async createComment(
    userId: number,
    userRole: string,
    eventId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    const event = await this.eventService.getEventForService(eventId);
    if (!event) throw new NotFoundException('Event not found');
    if (
      !checkVisibilityOfEvent(
        event,
        {
          owner: userId === event.host?.id,
          admin: userRole === 'admin',
        },
        userId,
      )
    )
      throw new NotFoundException('Event not found');
    const user = await this.usersService.getUserForService(userId);
    if (!user)
      throw new NotFoundException(
        'How... are you not existing if you reached that far into function?',
      );

    let parentComment: Comment | null = null;
    if (dto.parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId },
        select: { event: { id: true }, author: { id: true } },
        relations: { parent: { parent: true }, event: true, author: true },
      });

      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      if (parentComment.event.id !== eventId)
        throw new BadRequestException(
          'The parent comment you try to comment does not belong to this event',
        );
      if (parentComment.parent?.parent) {
        throw new BadRequestException(
          'Maximum comment depth reached (3 levels)',
        );
      }
    }

    const comment = await this.commentRepository.save({
      event,
      author: user,
      parent: parentComment,
      content: dto.content,
    });

    if (!parentComment) {
      if (userId !== event.host.id) {
        const owner = await this.usersService.getUserById(event.host.id);

        await this.notificationsService.createNotification({
          user: owner,
          type: NotificationType.EVENT_COMMENT,
          event: event,
        });
      }
    } else {
      if (parentComment.author.id !== userId) {
        const author = await this.usersService.getUserById(
          parentComment.author.id,
        );
        await this.notificationsService.createNotification({
          user: author,
          type: NotificationType.COMMENT_REPLY,
          event: event,
        });
      }
    }

    return mapCommentToResponse(comment, event.id);
  }

  async updateComment(
    userId: number,
    commentId: number,
    dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      select: { author: { id: true }, event: { id: true } },
      relations: { author: true, event: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (userId !== comment.author.id)
      throw new ForbiddenException('Only owner can update comment');

    comment.content = dto.content;
    return mapCommentToResponse(
      await this.commentRepository.save(comment),
      comment.event.id,
    );
  }

  async deleteComment(
    userId: number,
    userRole: string,
    commentId: number,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      select: { author: { id: true } },
      relations: { author: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id != userId && userRole !== 'admin')
      throw new ForbiddenException('Only owner or admin can delete comment');

    await this.commentRepository.delete(commentId);
  }
}
