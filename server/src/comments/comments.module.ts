import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { CommentsService } from './comments.service';
import { CommentController } from './comments.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    EventsModule,
    UsersModule,
    NotificationsModule,
    TypeOrmModule.forFeature([Comment]),
  ],
  providers: [CommentsService],
  controllers: [CommentController],
})
export class CommentsModule {}
