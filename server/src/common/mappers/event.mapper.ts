import { Comment } from 'src/comments/entities/comment.entity';
import { CommentResponse } from 'src/comments/types/commentResponse.type';
import { SafeCompanyResponse } from 'src/companies/types/safeCompanyResponse.type';
import { Event, EventStatus } from 'src/events/entities/event.entity';
import { EventResponse } from 'src/events/types/eventResponse.type';

export function toEventResponse(
  event: Event,
  permissions: { owner: boolean; admin: boolean; isAttendee: boolean },
): EventResponse {
  const { owner, admin, isAttendee } = permissions;
  const isPrivileged = owner || admin;

  const canSeeAttendees =
    isPrivileged ||
    event.visitor_visibility === 'everybody' ||
    (event.visitor_visibility === 'attendees_only' && isAttendee);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    price: event.price,
    ticket_limit: event.ticket_limit,
    address: event.address,
    poster_url: event.poster_url,
    start_date: event.start_date,
    end_date: event.end_date,
    status: event.status,
    format: event.format,
    theme: event.theme,

    ...(event.company && {
      company: {
        id: event.company.id,
        name: event.company.name,
        picture_url: event.company.picture_url,
      } as SafeCompanyResponse,
    }),

    ...(event.host && {
      host: {
        id: event.host.id,
        login: event.host.login,
        username: event.host.username,
        avatar_url: event.host.avatar_url,
      },
    }),

    ...(canSeeAttendees &&
      event.tickets && {
        tickets: event.tickets
          .filter((t) => t.user_is_visible_to_public || isPrivileged)
          .map((t) => ({
            id: t.id,
            user: {
              id: t.user.id,
              login: t.user.login,
              username: t.user.username,
              avatar_url: t.user.avatar_url,
            },
            status: t.status,
          })),
      }),

    ...(event.comments && {
      comments: event.comments.map((comment) =>
        mapCommentToResponse(comment, event.id),
      ),
    }),

    ...(isPrivileged &&
      event.promo_codes && {
        promo_codes: event.promo_codes.map((p) => ({
          id: p.id,
          event_id: event.id,
          code: p.code,
          discount_percentage: p.discount_percentage,
          expires_at: p.expires_at,
        })),
      }),

    ...(isPrivileged && {
      notificate_owner: event.notificate_owner,
      redirect_url: event.redirect_url,
      publish_date: event.publish_date,
      visitor_visibility: event.visitor_visibility,
    }),
  };
}

function mapCommentToResponse(
  comment: Comment,
  eventId: number,
): CommentResponse {
  return {
    id: comment.id,
    event_id: eventId,
    auhtor: {
      id: comment.author.id,
      login: comment.author.login,
      username: comment.author.username,
      avatar_url: comment.author.avatar_url,
    },
    content: comment.content,
    created_at: comment.created_at,
    parent: comment.parent ? ({ id: comment.parent.id } as any) : null,
    children: comment.children
      ? comment.children.map(mapCommentToResponse)
      : [],
  };
}

export function toVisibleEvents(
  events: Event[],
  permissions: { owner: boolean; admin: boolean },
  currentUserId?: number | null,
): EventResponse[] {
  const { owner, admin } = permissions;
  const now = new Date();

  return events
    .filter(
      (event) =>
        owner ||
        admin ||
        (event.status !== EventStatus.DRAFT && event.publish_date < now),
    )
    .map((event) => {
      const isAttendee =
        !!currentUserId &&
        (event.tickets ?? []).some((t) => t.user?.id === currentUserId);
      return toEventResponse(event, { owner, admin, isAttendee });
    });
}

export function checkVisibilityOfEvent(
  event: Event,
  permissions: { owner: boolean; admin: boolean },
  currentUserId?: number | null,
): EventResponse | null {
  const { owner, admin } = permissions;
  const now = new Date();

  const isPublished =
    event.status !== EventStatus.DRAFT && event.publish_date <= now;

  if (!owner && !admin && !isPublished) {
    return null;
  }

  const isAttendee =
    !!currentUserId &&
    (event.tickets ?? []).some((t) => t.user?.id === currentUserId);
  return toEventResponse(event, { owner, admin, isAttendee });
}
