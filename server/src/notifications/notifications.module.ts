import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailModule } from 'src/email/email.module';
import { User } from 'src/users/entities/user.entity'
import {UsersModule} from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), EmailModule, UsersModule,],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}