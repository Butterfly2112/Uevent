export enum NotificationType {
  EVENT_NEWS = 'event_news',
  NEW_EVENT = 'new_event',
  COMPANY_NEWS = 'company_news',
  EVENT_NEW_PARTICIPANT = 'event_new_participant',
  EVENT_COMMENT = 'event_comment',
  COMMENT_REPLY = 'comment_reply',
  TICKET_PURCHASE = 'ticket_purchase',
  EVENT_REMINDER = 'event_reminder',
  PAYMENT_SUCCESS = 'payment_success',
  REFUND_SUCCESS = 'refund_success',
  EVENT_CANCELED = 'event_canceled',
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
