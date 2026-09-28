import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { formatDay, initials } from '../../../lib/format';
import type { GatherEvent } from '../../../lib/data';
import {
  CATEGORY_ICON,
  CATEGORY_TONE,
  isFull,
  isGoing,
  isLive,
  isPast,
  isWaiting,
  priceLabel,
  seatsLeft,
} from './events';

interface EventCardProps {
  event: GatherEvent;
  me: string;
  onOpen: (event: GatherEvent) => void;
  onToggle: (event: GatherEvent) => void;
}

export function EventCard({ event, me, onOpen, onToggle }: EventCardProps) {
  const Icon = CATEGORY_ICON[event.category];
  const tone = CATEGORY_TONE[event.category];
  const going = isGoing(event, me);
  const waiting = isWaiting(event, me);
  const past = isPast(event);
  const live = isLive(event);
  const left = seatsLeft(event);
  const roster = event.going.slice(0, 4);

  return (
    <li className="dx-card group flex flex-col overflow-hidden transition-shadow duration-[180ms] hover:shadow-raise">
      <button
        type="button"
        onClick={() => onOpen(event)}
        aria-label={`Open ${event.title}`}
        className={cn(
          'relative flex h-28 items-end overflow-hidden bg-gradient-to-br px-4 pb-3 text-left',
          tone.wash,
        )}
      >
        <Icon
          size={104}
          aria-hidden="true"
          className="absolute -right-5 -top-6 text-nt-0/20 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="relative">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-nt-0/75">
            {formatDay(event.date)} · {event.start}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-[0.9375rem] font-medium leading-snug text-nt-0">
            {event.title}
          </h3>
        </div>

        {(live || event.required) && (
          <span
            className={cn(
              'absolute right-3 top-3 rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
              live ? 'bg-nt-0 text-grn-700' : 'bg-nt-0/85 text-ink',
            )}
          >
            {live ? 'Happening now' : 'Expected'}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <ul className="mb-3 space-y-1.5 text-[0.75rem] text-ink-muted">
          <li className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0" aria-hidden="true" />
            {event.start}–{event.end}
          </li>
          <li className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </li>
        </ul>

        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-[0.625rem] font-medium', tone.chip)}>
            {event.category}
          </span>
          <span className="rounded-full bg-nt-50 px-2 py-0.5 text-[0.625rem] text-ink-muted">
            {event.mode}
          </span>
          <span className="rounded-full bg-nt-50 px-2 py-0.5 text-[0.625rem] text-ink-muted">
            {priceLabel(event.price)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ul className="flex -space-x-1.5" aria-hidden="true">
              {roster.map((person) => (
                <li
                  key={person}
                  className="grid h-6 w-6 place-items-center rounded-full border border-nt-0 bg-nt-100 text-[0.5625rem] font-medium text-ink-muted"
                >
                  {initials(person)}
                </li>
              ))}
            </ul>
            <span className="flex items-center gap-1 text-[0.6875rem] text-ink-muted">
              <Users size={11} aria-hidden="true" />
              {event.going.length}
              {left === 0 ? ' · full' : ` · ${left} left`}
            </span>
          </div>

          {past ? (
            <span className="text-[0.6875rem] text-ink-subtle">Wrapped</span>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(event)}
              aria-pressed={going || waiting}
              className={cn(
                'rounded-md border px-3 py-1.5 text-[0.75rem] font-medium transition-all duration-[180ms]',
                going
                  ? 'border-grn-200 bg-grn-50 text-grn-700 hover:border-danger hover:bg-danger-bg hover:text-danger'
                  : waiting
                    ? 'border-line bg-nt-50 text-ink-muted hover:border-danger hover:text-danger'
                    : 'border-brand-600 bg-brand-600 text-nt-0 hover:bg-brand-700',
              )}
            >
              {going ? 'Going' : waiting ? 'Waiting' : isFull(event) ? 'Join waitlist' : "I'm in"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
