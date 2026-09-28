import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { Booking, Space } from '../../../lib/data';
import {
  HOURS,
  KIND_ICON,
  STATUS,
  availabilityAt,
  bookingsFor,
  clockNow,
  fractionToClock,
  groupByLevel,
  nowPercent,
  span,
} from './spaces';

interface ScheduleProps {
  spaces: Space[];
  bookings: Booking[];
  date: string;
  live: boolean;
  mine?: string;
  onPickSlot: (space: Space, start: string) => void;
  onOpenBooking: (booking: Booking) => void;
}

function useMinuteTick(active: boolean): void {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(timer);
  }, [active]);
}

export function Schedule({ spaces, bookings, date, live, mine, onPickSlot, onOpenBooking }: ScheduleProps) {
  useMinuteTick(live);

  const marker = live ? nowPercent() : null;
  const groups = groupByLevel(spaces);

  const openAt = (space: Space, event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      const now = clockNow();
      const { free, until } = availabilityAt(bookingsFor(bookings, space.id, date), now);
      onPickSlot(space, free || !until ? now : until);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    onPickSlot(space, fractionToClock((event.clientX - rect.left) / rect.width));
  };

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <div className="relative min-w-[46rem]">
        <div className="flex border-b border-line">
          <div className="w-36 shrink-0" />
          <div className="relative flex flex-1">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 border-l border-line py-1.5 pl-1.5 text-[0.625rem] tabular-nums text-ink-subtle"
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
            {marker !== null && (
              <span
                style={{ left: `${marker}%` }}
                className="absolute top-1 grid h-4 -translate-x-1/2 place-items-center rounded-full bg-ink px-1.5 text-[0.5625rem] font-medium text-nt-0"
              >
                now
              </span>
            )}
          </div>
        </div>

        {groups.map((group) => (
          <section key={group.level} aria-label={group.level}>
            <h4 className="dx-eyebrow border-b border-line bg-nt-50 px-4 py-1.5">{group.level}</h4>

            {group.spaces.map((space) => {
              const booked = bookingsFor(bookings, space.id, date);
              const Icon = KIND_ICON[space.kind];

              return (
                <div key={space.id} className="flex border-b border-line last:border-b-0">
                  <div className="flex w-36 shrink-0 items-center gap-2 px-4 py-2.5">
                    <Icon size={13} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8125rem] font-medium text-ink">
                        {space.name}
                      </span>
                      <span className="block truncate text-[0.625rem] text-ink-subtle">
                        {space.offline
                          ? 'Offline'
                          : `${space.capacity} ${space.capacity === 1 ? 'seat' : 'seats'}`}
                      </span>
                    </span>
                  </div>

                  <div className="relative min-h-[3.25rem] flex-1">
                    <div className="absolute inset-0 flex" aria-hidden="true">
                      {HOURS.map((hour) => (
                        <div key={hour} className="flex-1 border-l border-line/70" />
                      ))}
                    </div>

                    {space.offline ? (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, var(--dx-neutral-100) 0 6px, transparent 6px 12px)',
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => openAt(space, event)}
                        aria-label={`Book ${space.name}`}
                        className="absolute inset-0 rounded-none transition-colors duration-[180ms] hover:bg-brand-50/60"
                      />
                    )}

                    {booked.map((booking) => {
                      const place = span(booking.start, booking.end);
                      const tone = STATUS[booking.status];
                      const owned = mine !== undefined && booking.organizer === mine;

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => onOpenBooking(booking)}
                          title={`${booking.purpose} · ${booking.start}–${booking.end} · ${booking.organizer}`}
                          aria-label={`${booking.purpose}, ${booking.start} to ${booking.end}, ${space.name}`}
                          style={{ left: `${place.left}%`, width: `${place.width}%` }}
                          className={cn(
                            'absolute inset-y-2 flex items-center overflow-hidden rounded-md border px-1.5 text-left transition-shadow duration-[180ms] hover:shadow-raise',
                            tone.block,
                            owned && 'ring-1 ring-inset ring-brand-600',
                          )}
                        >
                          <span className="truncate text-[0.6875rem] font-medium leading-tight">
                            {booking.purpose}
                          </span>
                        </button>
                      );
                    })}

                    {space.approval && (
                      <span
                        className="pointer-events-none absolute right-1.5 top-1.5 text-ink-subtle"
                        title="Bookings need approval"
                      >
                        <Lock size={11} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        {marker !== null && (
          <div className="pointer-events-none absolute bottom-0 left-36 right-0 top-6" aria-hidden="true">
            <span
              style={{ left: `${marker}%` }}
              className="absolute inset-y-0 w-px -translate-x-1/2 bg-ink/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
