import { CalendarClock, MapPin, Star } from 'lucide-react';
import { cn } from '../../ui/utils';
import { formatDay, money, timeAgo } from '../../../lib/format';
import { nextApproval, serviceById, totalOf } from '../../../lib/catalogue';
import type { ServiceRequest } from '../../../lib/data';
import { Rating } from '../../shell/Rating';
import { ChainDots } from './ChainDots';
import { StageChip } from './StageChip';

interface RequestCardProps {
  request: ServiceRequest;
  onOpen: (request: ServiceRequest) => void;
}

export function RequestCard({ request, onOpen }: RequestCardProps) {
  const Icon = serviceById(request.serviceId)?.icon;
  const last = request.thread[request.thread.length - 1];
  const pending = nextApproval(request);
  const unrated = request.stage === 'delivered' && request.rating === undefined;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(request)}
        className="dx-card block w-full px-5 py-4 text-left transition-all duration-[180ms] hover:border-brand-300 hover:shadow-raise"
      >
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-nt-50 text-brand-600">
              <Icon size={17} aria-hidden="true" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1">
              {request.ref} · {request.category}
            </p>
            <p className="truncate text-body font-medium text-ink">
              {request.service}
              {request.quantity > 1 && ` × ${request.quantity}`}
            </p>
            <p className="mt-0.5 truncate text-[0.8125rem] text-ink-muted">{request.choice}</p>
          </div>

          <span className="shrink-0 text-body font-medium tabular-nums text-ink">
            {totalOf(request) === 0 ? '—' : money(totalOf(request))}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StageChip stage={request.stage} />
          {pending && (
            <span className="text-[0.6875rem] text-ink-muted">with {pending.approver}</span>
          )}
          <ChainDots request={request} />
          {request.rating !== undefined && <Rating value={request.rating} />}
          {unrated && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
              <Star size={10} aria-hidden="true" />
              Rate it
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5 text-[0.75rem] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} aria-hidden="true" className="shrink-0" />
            {request.deliverTo}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={11} aria-hidden="true" className="shrink-0" />
            Wanted {formatDay(request.neededBy).toLowerCase()}
          </span>
        </div>

        {last && last.kind === 'note' && (
          <p
            className={cn(
              'mt-2.5 truncate rounded-md bg-nt-50 px-3 py-2 text-[0.75rem] text-ink-muted',
            )}
          >
            <span className="font-medium text-ink">{last.author}</span> · {last.body} ·{' '}
            {timeAgo(last.at)}
          </p>
        )}
      </button>
    </li>
  );
}
