import { UserRoundPlus } from 'lucide-react';
import { cn } from '../../ui/utils';
import { initials, timeAgo } from '../../../lib/format';
import { slaState } from '../../../lib/sla';
import type { Ticket } from '../../../lib/data';
import { Rating } from './Rating';
import { SlaPill } from './SlaPill';
import { PRIORITY_TONE, STATUS_LABEL, STATUS_TONE, TEAM_ICON } from './support';

interface QueueRowProps {
  ticket: Ticket;
  onOpen: (ticket: Ticket) => void;
  onTake: (ticket: Ticket) => void;
}

export function QueueRow({ ticket, onOpen, onTake }: QueueRowProps) {
  const Glyph = TEAM_ICON[ticket.team];
  const breached = slaState(ticket) === 'breached';

  return (
    <li
      className={cn(
        'relative grid items-center gap-x-4 gap-y-2.5 border-b border-line px-4 py-3.5 transition-colors duration-[150ms] last:border-b-0 hover:bg-nt-50',
        'grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_9rem_11rem_7rem]',
      )}
    >
      {breached && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-danger" />
      )}

      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-nt-100 text-ink-muted"
      >
        <Glyph size={15} />
      </span>

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onOpen(ticket)}
          className="block w-full truncate rounded-sm text-left text-body font-medium text-ink hover:text-brand-700"
        >
          {ticket.subject}
        </button>
        <p className="truncate text-[0.75rem] text-ink-muted">
          {ticket.ref} · {ticket.location} · {ticket.requester} · {timeAgo(ticket.openedAt)}
        </p>
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-1.5 xl:col-start-3">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium capitalize',
            PRIORITY_TONE[ticket.priority],
          )}
        >
          {ticket.priority}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
            STATUS_TONE[ticket.status],
          )}
        >
          {ticket.status === 'waiting' ? 'Waiting' : STATUS_LABEL[ticket.status]}
        </span>
      </div>

      <div className="col-start-2 xl:col-start-4">
        {ticket.status === 'resolved' ? (
          ticket.rating === undefined ? (
            <span className="text-[0.75rem] text-ink-subtle">Not rated</span>
          ) : (
            <Rating value={ticket.rating} />
          )
        ) : (
          <SlaPill ticket={ticket} withBar />
        )}
      </div>

      <div className="col-start-2 xl:col-start-5 xl:justify-self-end">
        {ticket.assignee ? (
          <span className="flex items-center gap-2 text-[0.75rem] text-ink-muted">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium"
            >
              {initials(ticket.assignee)}
            </span>
            <span className="truncate xl:hidden">{ticket.assignee}</span>
          </span>
        ) : (
          <button type="button" onClick={() => onTake(ticket)} className="dx-btn-secondary">
            <UserRoundPlus size={13} aria-hidden="true" />
            Assign
          </button>
        )}
      </div>
    </li>
  );
}
