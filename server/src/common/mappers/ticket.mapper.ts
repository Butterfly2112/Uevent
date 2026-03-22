import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketResponse } from 'src/tickets/types/ticketResponse.type';
import { toUserResponse } from './user.mapper';

export function toTicketResponse(ticket: Ticket): TicketResponse {
  return {
    id: ticket.id,
    event: {
      id: ticket.event.id,
      title: ticket.event.title,
      price: ticket.event.price,
    },
    user: toUserResponse(ticket.user),
    user_is_visible_to_public: ticket.user_is_visible_to_public,

    ...(ticket.promo_code && {
      promo_code: {
        id: ticket.promo_code.id,
        event_id: ticket.event.id,
        code: ticket.promo_code.code,
        discount_percentage: ticket.promo_code.discount_percentage,
        expires_at: ticket.promo_code.expires_at,
      },
    }),
    price_paid: ticket.price_paid,
    status: ticket.status,
  };
}
