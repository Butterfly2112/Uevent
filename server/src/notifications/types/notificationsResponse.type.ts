import { EmailStatus, NotificationType } from './notificationsType.type';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  send_email: boolean;
  email_status: EmailStatus | null;
  attempts: number;
  sent_at: Date | null;
  created_at: Date;
}