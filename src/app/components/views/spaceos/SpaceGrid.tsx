import { Lock, Wrench } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { Booking, Space } from '../../../lib/data';
import { DAY_START, KIND_ICON, availabilityAt, bookingsFor, clockNow, toClock } from './spaces';

interface SpaceGridProps {
  spaces: Space[];
  bookings: Booking[];
  date: string;
  live: boolean;
  onBook: (space: Space, start: string) => void;
}

export function SpaceGrid({ spaces, bookings, date, live, onBook }: SpaceGridProps) {
  const reference = live ? clockNow() : toClock(DAY_START * 60);

  return (
    <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => {
        const Icon = KIND_ICON[space.kind];
        const booked = bookingsFor(bookings, space.id, date);
        const { free, until, holder } = availabilityAt(booked, reference);

        return (
          <li key={space.id} className="flex flex-col rounded-lg border border-line bg-nt-0 p-4">
            <div className="mb-3 flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nt-100 text-ink-muted"
              >
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="flex items-center gap-1.5 truncate text-[0.875rem] font-medium text-ink">
                  {space.name}
                  {space.approval && (
                    <Lock size={11} className="shrink-0 text-ink-subtle" aria-label="Needs approval" />
                  )}
                </h4>
                <p className="truncate text-[0.75rem] text-ink-muted">
                  {space.level} · seats {space.capacity}
                </p>
              </div>
            </div>

            <p
              className={cn(
                'mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium',
                space.offline
                  ? 'bg-nt-100 text-ink-subtle'
                  : free
                    ? 'bg-grn-100 text-grn-700'
                    : 'bg-warning-bg text-warning',
              )}
            >
              {space.offline ? (
                <>
                  <Wrench size={11} aria-hidden="true" />
                  Offline
                </>
              ) : free ? (
                until ? (
                  `Free until ${until}`
                ) : live ? (
                  'Free for the rest of the day'
                ) : (
                  'Free all day'
                )
              ) : (
                `Busy until ${holder?.end}`
              )}
            </p>

            {space.amenities.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-1.5">
                {space.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-full bg-nt-50 px-2 py-0.5 text-[0.625rem] text-ink-muted"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-nt-100" aria-hidden="true">
                  <span
                    style={{ width: `${space.utilisation}%` }}
                    className={cn(
                      'block h-full rounded-full',
                      space.utilisation > 75 ? 'bg-warning' : 'bg-brand-400',
                    )}
                  />
                </span>
                <span className="text-[0.625rem] tabular-nums text-ink-subtle">
                  {space.utilisation}% used
                </span>
              </div>

              <button
                type="button"
                disabled={space.offline}
                onClick={() => onBook(space, free || !until ? reference : until)}
                className="dx-btn-secondary w-full disabled:opacity-50"
              >
                {space.offline ? space.note ?? 'Unavailable' : 'Book it'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
