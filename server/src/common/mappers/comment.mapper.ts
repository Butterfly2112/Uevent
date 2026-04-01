import { Comment } from 'src/comments/entities/comment.entity';
import { CommentResponse } from 'src/comments/types/commentResponse.type';

export function mapCommentToResponse(
  comment: Comment,
  eventId: number,
): CommentResponse {
  return {
    id: comment.id,
    event_id: eventId,
    author: {
      id: comment.author.id,
      login: comment.author.login,
      username: comment.author.username,
      avatar_url: comment.author.avatar_url,
    },
    content: comment.content,
    created_at: comment.created_at,
    parent: comment.parent ? ({ id: comment.parent.id } as any) : null,
    children: comment.children
      ? comment.children.map((child) => mapCommentToResponse(child, eventId))
      : [],
  };
}

export function buildCommentTree(
  comments: Comment[],
  eventId: number,
): CommentResponse[] {
  const map = new Map<number, CommentResponse>();

  comments.forEach((comment) => {
    map.set(comment.id, {
      id: comment.id,
      event_id: eventId,
      author: {
        id: comment.author.id,
        login: comment.author.login,
        username: comment.author.username,
        avatar_url: comment.author.avatar_url,
      },
      content: comment.content,
      created_at: comment.created_at,
      parent: null,
      children: [],
    });
  });

  const roots: CommentResponse[] = [];

  comments.forEach((comment) => {
    const node = map.get(comment.id)!;
    if (comment.parent) {
      const parentNode = map.get(comment.parent.id);
      if (parentNode) {
        node.parent = { id: comment.parent.id } as any;
        parentNode.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
