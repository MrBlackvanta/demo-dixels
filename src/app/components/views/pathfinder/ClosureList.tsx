import { CalendarClock, Pencil, Power, Trash2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { formatDay } from '../../../lib/format';
import { closureBite, inForce } from '../../../lib/wayfinding';
import type { Closure, Place } from '../../../lib/data';

interface ClosureListProps {
  closures: Closure[];
  places: Place[];
  today: string;
  onToggle: (closure: Closure) => void;
  onEdit: (closure: Closure) => void;
  onDelete: (closure: Closure) => void;
}

export function ClosureList({
  closures,
  places,
  today,
  onToggle,
  onEdit,
  onDelete,
}: ClosureListProps) {
  return (
    <ul className="divide-y divide-line">
      {closures.map((closure) => {
        const live = inForce(closure, today);
        const upcoming = closure.active && closure.from > today;

        return (
          <li key={closure.id} className="flex flex-wrap items-start gap-x-4 gap-y-2.5 px-4 py-4">
            <span
              className={cn(
                'mt-0.5 size-2 shrink-0 rounded-full',
                live ? 'bg-warning' : upcoming ? 'bg-brand-400' : 'bg-nt-300',
              )}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[0.875rem] font-medium text-ink">{closure.title}</span>
                <span
                  className={cn(
                    'dx-chip',
                    live
                      ? 'border-warning/40 text-warning'
                      : upcoming
                        ? 'border-brand-300 text-brand-700'
                        : 'border-line text-ink-subtle',
                  )}
                >
                  {live ? 'In force now' : upcoming ? 'Scheduled' : 'Not in force'}
                </span>
              </p>

              <p className="mt-1 text-[0.75rem] text-ink-subtle">
                {closureBite(closure, places)}
              </p>

              <p className="mt-2 text-[0.8125rem] text-ink-muted">{closure.reason}</p>

              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-subtle">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={11} aria-hidden="true" />
                  {formatDay(closure.from)} to {formatDay(closure.until)}
                </span>
                <span>Raised by {closure.raisedBy}</span>
              </p>
            </div>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onToggle(closure)}
                aria-label={closure.active ? `Switch off ${closure.title}` : `Switch on ${closure.title}`}
                className={cn('dx-btn-ghost', closure.active && 'text-brand-700')}
              >
                <Power size={13} aria-hidden="true" />
                {closure.active ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => onEdit(closure)}
                aria-label={`Edit ${closure.title}`}
                className="dx-btn-ghost"
              >
                <Pencil size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(closure)}
                aria-label={`Delete ${closure.title}`}
                className="dx-btn-ghost"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
