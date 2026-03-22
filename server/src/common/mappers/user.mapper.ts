import { User } from 'src/users/entities/user.entity';
import { UserResponse } from 'src/users/types/userResponse.type';
import { UserDetailedInfo } from 'src/users/types/userDetailedInfo.type';
import { toTicketResponse } from './ticket.mapper';
import { mapCompanyProfileToDTO } from './company.mapper';
import { EventStatus } from 'src/events/entities/event.entity';
import { toVisibleEvents } from './event.mapper';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    login: user.login,
    username: user.username,
    avatar_url: user.avatar_url,
  };
}

export function toUserDetailedInfo(
  user: User,
  permissions: { owner: boolean; admin: boolean },
): UserDetailedInfo {
  const { owner, admin } = permissions;
  const isPrivileged = owner || admin;

  return {
    id: user.id,
    login: user.login,
    username: user.username,
    avatar_url: user.avatar_url,
    hosted_events: toVisibleEvents(user.hosted_events ?? [], permissions, null),

    company: user.company
      ? mapCompanyProfileToDTO(user.company, owner ? user.id : null)
      : undefined,

    ...(isPrivileged && {
      email: user.email,
      role: user.role,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
      notifications: user.notifications,
      tickets: user.tickets?.map(toTicketResponse),
      following: user.following?.map(toUserResponse) ?? [],
      followers: user.followers?.map(toUserResponse) ?? [],
    }),
  };
}

function toEventBrief(event: any) {
  return {
    id: event.id,
    title: event.title,
    status: event.status,
    start_date: event.start_date,
    end_date: event.end_date,
    poster_url: event.poster_url,
  };
}
