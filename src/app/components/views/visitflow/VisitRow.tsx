import type { ReactNode } from 'react';
import { Car, IdCard } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { Visit } from '../../../lib/data';
import { STATUS, durationLabel, formatDay, initials, minutesOnSite } from './visits';

interface VisitRowProps {
  visit: Visit;
  selected?: boolean;
  onSelect?: (visit: Visit) => void;
  showDay?: boolean;
  actions?: ReactNode;
}

export function VisitRow({ visit, selected, onSelect, showDay, actions }: VisitRowProps) {
  const tone = STATUS[visit.status];
  const onSite = minutesOnSite(visit);
  const faded = visit.status === 'cancelled' || visit.status === 'checked-out';

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.75rem] font-medium',
          faded ? 'bg-nt-100 text-ink-subtle' : 'bg-brand-50 text-brand-700',
        )}
      >
        {initials(visit.guest)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              'truncate text-[0.8125rem] font-medium',
              faded ? 'text-ink-muted line-through decoration-line-strong' : 'text-ink',
            )}
          >
            {visit.guest}
          </span>
          {visit.parking && !faded && (
            <Car size={12} className="shrink-0 text-ink-subtle" aria-label="Parking reserved" />
          )}
        </span>
        <span className="block truncate text-[0.6875rem] text-ink-muted">
          {visit.company}
          {visit.purpose && ` · ${visit.purpose}`}
        </span>
      </span>

      <span className="hidden shrink-0 text-right sm:block">
        <span className="block text-[0.8125rem] tabular-nums text-ink">{visit.time}</span>
        <span className="block text-[0.6875rem] text-ink-muted">
          {showDay ? formatDay(visit.date) : (visit.location ?? '')}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {visit.badge && (
          <span className="hidden items-center gap-1 rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] font-medium tabular-nums text-ink-muted sm:inline-flex">
            <IdCard size={11} aria-hidden="true" />
            {visit.badge}
          </span>
        )}
        <span
          className={cn(
            'items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-medium',
            tone.className,
            actions ? 'hidden sm:inline-flex' : 'inline-flex',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />
          {onSite !== null ? durationLabel(onSite) : tone.label}
        </span>
      </span>
    </>
  );

  if (!onSelect) {
    return (
      <div className="flex items-center gap-3 px-5 py-3">
        {body}
        {actions}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onSelect(visit)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 px-5 py-3 text-left transition-colors duration-[180ms]',
          selected ? 'bg-brand-50' : 'hover:bg-nt-50',
        )}
      >
        {body}
      </button>
      {actions && <div className="flex shrink-0 items-center gap-1 pr-4">{actions}</div>}
    </div>
  );
}
