import { useState } from 'react';
import { Heart, MessageCircle, Pin, PinOff, Trash2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { initials, timeAgo } from '../../../lib/format';
import type { Post, Tribe } from '../../../lib/data';
import { KIND_LABEL, KIND_TONE } from './community';

interface PostCardProps {
  post: Post;
  tribe?: Tribe;
  me: string;
  onLike: (post: Post) => void;
  onReply: (post: Post, body: string) => void;
  onOpenTribe?: (tribe: Tribe) => void;
  onPin?: (post: Post) => void;
  onRemove?: (post: Post) => void;
}

export function PostCard({
  post,
  tribe,
  me,
  onLike,
  onReply,
  onOpenTribe,
  onPin,
  onRemove,
}: PostCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [body, setBody] = useState('');
  const liked = post.likes.includes(me);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    onReply(post, text);
    setBody('');
  };

  return (
    <li className="dx-card overflow-hidden">
      <article>
        <div className="flex items-start gap-3 px-5 pt-4">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.6875rem] font-medium text-ink-muted"
          >
            {initials(post.author)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[0.875rem] font-medium text-ink">{post.author}</p>
            <p className="flex flex-wrap items-center gap-x-1.5 text-[0.75rem] text-ink-muted">
              {tribe &&
                (onOpenTribe ? (
                  <button
                    type="button"
                    onClick={() => onOpenTribe(tribe)}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {tribe.name}
                  </button>
                ) : (
                  <span className="font-medium text-ink-muted">{tribe.name}</span>
                ))}
              {tribe && <span aria-hidden="true">·</span>}
              <time dateTime={post.at}>{timeAgo(post.at)}</time>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {post.pinned && (
              <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] font-medium text-brand-700">
                <Pin size={9} aria-hidden="true" />
                Pinned
              </span>
            )}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
                KIND_TONE[post.kind],
              )}
            >
              {KIND_LABEL[post.kind]}
            </span>
          </div>
        </div>

        <p className="whitespace-pre-line px-5 py-3 pl-[4.25rem] text-[0.875rem] leading-relaxed text-ink">
          {post.body}
        </p>

        <div className="flex flex-wrap items-center gap-1 border-t border-line bg-nt-50 px-5 py-2.5">
          <button
            type="button"
            onClick={() => onLike(post)}
            aria-pressed={liked}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] transition-colors duration-[180ms]',
              liked ? 'text-danger' : 'text-ink-muted hover:text-ink',
            )}
          >
            <Heart size={13} aria-hidden="true" className={cn(liked && 'fill-current')} />
            {post.likes.length}
          </button>

          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            aria-expanded={showReplies}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.75rem] text-ink-muted transition-colors duration-[180ms] hover:text-ink"
          >
            <MessageCircle size={13} aria-hidden="true" />
            {post.replies.length === 1 ? '1 reply' : `${post.replies.length} replies`}
          </button>

          {(onPin || onRemove) && (
            <span className="ml-auto flex items-center gap-1">
              {onPin && (
                <button
                  type="button"
                  onClick={() => onPin(post)}
                  aria-label={post.pinned ? `Unpin ${post.author}'s post` : `Pin ${post.author}'s post`}
                  className="dx-btn-ghost px-2 py-1"
                >
                  {post.pinned ? <PinOff size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(post)}
                  aria-label={`Delete ${post.author}'s post`}
                  className="dx-btn-ghost px-2 py-1 hover:bg-danger-bg hover:text-danger"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              )}
            </span>
          )}
        </div>

        {showReplies && (
          <div className="border-t border-line px-5 py-3.5">
            {post.replies.length > 0 && (
              <ul className="mb-3 space-y-3">
                {post.replies.map((reply) => (
                  <li key={`${reply.author}-${reply.at}`} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.5625rem] font-medium text-ink-muted"
                    >
                      {initials(reply.author)}
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg bg-nt-50 px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[0.75rem]">
                        <span className="font-medium text-ink">{reply.author}</span>
                        <time dateTime={reply.at} className="text-ink-subtle">
                          {timeAgo(reply.at)}
                        </time>
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink">{reply.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={send} className="flex items-center gap-2">
              <input
                type="text"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={`Reply to ${post.author.split(' ')[0]}`}
                aria-label={`Reply to ${post.author}`}
                className="dx-field"
              />
              <button type="submit" disabled={!body.trim()} className="dx-btn-primary shrink-0">
                Reply
              </button>
            </form>
          </div>
        )}
      </article>
    </li>
  );
}
