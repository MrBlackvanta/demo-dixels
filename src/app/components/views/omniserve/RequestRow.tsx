import { cn } from '../../ui/utils';
import { formatDay, initials, money } from '../../../lib/format';
import { serviceById, totalOf } from '../../../lib/catalogue';
import type { ServiceRequest } from '../../../lib/data';
import { ChainDots } from './ChainDots';
import { StageChip } from './StageChip';
import { waitingOn } from './desk';

interface RequestRowProps {
  request: ServiceRequest;
  onOpen: (request: ServiceRequest) => void;
}

export function RequestRow({ request, onOpen }: RequestRowProps) {
  const Icon = serviceById(request.serviceId)?.icon;
  const value = totalOf(request);
  const unclaimed = request.stage === 'arranging' && !request.handler;

  return (
    <li
      className={cn(
        'relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3 transition-colors duration-[150ms] last:border-b-0 hover:bg-nt-50',
        'xl:grid-cols-[auto_minmax(0,1fr)_7rem_10rem_8rem]',
      )}
    >
      {unclaimed && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-warning" />
      )}

      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-lg bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
      >
        {Icon ? <Icon size={15} /> : initials(request.requester)}
      </span>

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onOpen(request)}
          className="block w-full truncate rounded-sm text-left text-body font-medium text-ink hover:text-brand-700"
        >
          {request.service}
          {request.quantity > 1 && ` × ${request.quantity}`}
        </button>
        <p className="truncate text-[0.75rem] text-ink-muted">
          {request.ref} · {request.requester} · {request.costCentre}
        </p>
      </div>

      <span className="col-start-2 text-body font-medium tabular-nums text-ink xl:col-start-3 xl:text-right">
        {value === 0 ? '—' : money(value)}
      </span>

      <div className="col-start-2 xl:col-start-4">
        <StageChip stage={request.stage} />
        <p className="mt-1 truncate text-[0.6875rem] text-ink-muted">with {waitingOn(request)}</p>
      </div>

      <div className="col-start-2 xl:col-start-5">
        <ChainDots request={request} />
        <p className="mt-1 text-[0.6875rem] text-ink-subtle">
          wanted {formatDay(request.neededBy).toLowerCase()}
        </p>
      </div>
    </li>
  );
}
