import { EmailStatus, NotificationType } from './notifications-type.enum';

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