import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../ui/utils';
import { todayKey } from '../../../lib/format';
import type { GatherEvent } from '../../../lib/data';
import {
  CATEGORY_TONE,
  WEEKDAYS,
  dayNumber,
  isGoing,
  monthGrid,
  monthLabel,
  monthOf,
  shiftMonth,
  toMinutes,
} from './events';

interface MonthCalendarProps {
  month: string;
  onMonth: (month: string) => void;
  events: GatherEvent[];
  me: string;
  onOpen: (event: GatherEvent) => void;
}

export function MonthCalendar({ month, onMonth, events, me, onOpen }: MonthCalendarProps) {
  const today = todayKey();
  const days = monthGrid(month);

  const byDay = new Map<string, GatherEvent[]>();
  events.forEach((event) => {
    const bucket = byDay.get(event.date) ?? [];
    bucket.push(event);
    byDay.set(event.date, bucket);
  });
  byDay.forEach((bucket) => bucket.sort((a, b) => toMinutes(a.start) - toMinutes(b.start)));

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[0.9375rem] font-medium text-ink">{monthLabel(month)}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
            className="dx-btn-ghost px-2 py-1.5"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMonth(monthOf(today))}
            disabled={month === monthOf(today)}
            className="dx-btn-ghost px-2.5 py-1.5 text-[0.75rem] disabled:opacity-40"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => onMonth(shiftMonth(month, 1))}
            aria-label="Next month"
            className="dx-btn-ghost px-2 py-1.5"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-7 border-b border-line bg-nt-50">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="py-2 text-center text-[0.625rem] font-medium uppercase tracking-[0.06em] text-ink-subtle"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const outside = monthOf(day) !== month;
            const bucket = byDay.get(day) ?? [];

            return (
              <div
                key={day}
                className={cn(
                  'min-h-[5.5rem] border-b border-r border-line p-1.5 last:border-r-0',
                  outside && 'bg-nt-50/60',
                )}
              >
                <span
                  className={cn(
                    'mb-1 grid h-5 w-5 place-items-center rounded-full text-[0.6875rem] tabular-nums',
                    day === today
                      ? 'bg-brand-600 font-medium text-nt-0'
                      : outside
                        ? 'text-ink-subtle'
                        : 'text-ink-muted',
                  )}
                >
                  {dayNumber(day)}
                </span>

                <ul className="space-y-1">
                  {bucket.slice(0, 3).map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(event)}
                        title={`${event.title} · ${event.start}`}
                        className={cn(
                          'flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[0.625rem] leading-tight transition-colors duration-[180ms] hover:bg-nt-100',
                          isGoing(event, me) ? 'font-medium text-ink' : 'text-ink-muted',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            CATEGORY_TONE[event.category].bar,
                          )}
                        />
                        <span className="truncate">{event.title}</span>
                      </button>
                    </li>
                  ))}
                  {bucket.length > 3 && (
                    <li className="px-1 text-[0.625rem] text-ink-subtle">
                      +{bucket.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
