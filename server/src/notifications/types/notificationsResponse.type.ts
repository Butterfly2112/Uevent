export interface NotificationResponse {
  id: number;
  type:
    | 'event_news'
    | 'new_event'
    | 'company_new_user'
    | 'event_comment'
    | 'comment_reply'
    | 'ticket_purchase'
    | 'event_reminder'
    | 'payment_success';
  title: string;
  message: string;
  is_read: boolean;
  send_email: boolean;
  email_status: 'pending' | 'sent' | 'failed' | null;
  attempts: number;
  sent_at: Date | null;
  created_at: Date;
}