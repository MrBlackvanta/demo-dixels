import { ChevronRight, MessageSquareText, Star } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import type { Ticket } from '../../../lib/data';
import { Rating } from './Rating';
import { SlaPill } from './SlaPill';
import {
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TEAM_ICON,
  lastWord,
  needsRating,
} from './support';

interface TicketCardProps {
  ticket: Ticket;
  onOpen: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onOpen }: TicketCardProps) {
  const Glyph = TEAM_ICON[ticket.team];
  const last = lastWord(ticket);
  const closed = ticket.status === 'resolved';

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(ticket)}
        className="dx-card group w-full px-5 py-4 text-left transition-shadow duration-[180ms] hover:shadow-raise"
      >
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-nt-100 text-ink-muted"
          >
            <Glyph size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1">
              {ticket.ref} · {ticket.category}
            </p>
            <p className="truncate text-body-lg font-medium text-ink">{ticket.subject}</p>
            <p className="mt-0.5 truncate text-[0.75rem] text-ink-muted">
              {ticket.location} · {ticket.assignee ? `with ${ticket.assignee}` : 'not picked up yet'}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                  STATUS_TONE[ticket.status],
                )}
              >
                {STATUS_LABEL[ticket.status]}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium capitalize',
                  PRIORITY_TONE[ticket.priority],
                )}
              >
                {ticket.priority}
              </span>
              {!closed && <SlaPill ticket={ticket} />}
              {ticket.rating !== undefined && <Rating value={ticket.rating} />}
              {needsRating(ticket) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
                  <Star size={11} aria-hidden="true" />
                  Rate it
                </span>
              )}
            </div>

            {last && last.kind === 'note' && (
              <p className="mt-2.5 flex items-start gap-1.5 text-[0.75rem] text-ink-muted">
                <MessageSquareText size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="line-clamp-1">
                  <span className="font-medium text-ink">{last.author.split(' ')[0]}:</span>{' '}
                  {last.body}
                </span>
              </p>
            )}
          </div>

          <ChevronRight
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-ink-subtle transition-transform duration-[180ms] group-hover:translate-x-0.5"
          />
        </div>

        <span className="sr-only">Raised {timeAgo(ticket.openedAt)}</span>
      </button>
    </li>
  );
}
