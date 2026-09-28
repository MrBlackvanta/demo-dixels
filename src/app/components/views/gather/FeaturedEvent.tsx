import { ArrowRight, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { formatDay, initials } from '../../../lib/format';
import { CURRENT_USER } from '../../../lib/data';
import type { GatherEvent } from '../../../lib/data';
import {
  CATEGORY_ICON,
  CATEGORY_TONE,
  isFull,
  isGoing,
  isWaiting,
  priceLabel,
  seatsLeft,
} from './events';

const me = CURRENT_USER.name;

interface FeaturedEventProps {
  event: GatherEvent;
  onOpen: (event: GatherEvent) => void;
  onToggle: (event: GatherEvent) => void;
}

export function FeaturedEvent({ event, onOpen, onToggle }: FeaturedEventProps) {
  const Icon = CATEGORY_ICON[event.category];
  const tone = CATEGORY_TONE[event.category];
  const going = isGoing(event, me);
  const waiting = isWaiting(event, me);
  const left = seatsLeft(event);

  return (
    <article
      className={cn(
        'relative mb-4 overflow-hidden rounded-lg bg-gradient-to-br px-6 py-6 sm:px-8 sm:py-7',
        tone.wash,
      )}
    >
      <Icon
        size={220}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-10 text-nt-0/12"
      />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0 max-w-xl">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-nt-0/75">
            Next up · {event.category}
          </p>
          <h4 className="mt-1.5 text-balance text-[1.5rem] font-medium leading-tight text-nt-0">
            {event.title}
          </h4>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-nt-0/80">{event.summary}</p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-nt-0/80">
            <li className="flex items-center gap-1.5">
              <Clock size={13} aria-hidden="true" />
              {formatDay(event.date)} · {event.start}–{event.end}
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" />
              {event.location}
            </li>
            <li className="flex items-center gap-1.5">
              <Users size={13} aria-hidden="true" />
              {event.going.length} going{left === 0 ? ' · full' : ` · ${left} left`}
            </li>
            <li>{priceLabel(event.price)}</li>
          </ul>
        </div>

        <div className="flex flex-col items-start gap-3">
          <ul className="flex -space-x-2" aria-hidden="true">
            {event.going.slice(0, 6).map((person) => (
              <li
                key={person}
                className="grid h-8 w-8 place-items-center rounded-full border border-nt-0/30 bg-nt-0/15 text-[0.625rem] font-medium text-nt-0 backdrop-blur-sm"
              >
                {initials(person)}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onToggle(event)}
              aria-pressed={going || waiting}
              className={cn(
                'rounded-md px-4 py-2 text-[0.8125rem] font-medium transition-colors duration-[180ms]',
                going || waiting
                  ? 'bg-nt-0/15 text-nt-0 hover:bg-nt-0/25'
                  : 'bg-nt-0 text-ink hover:bg-nt-100',
              )}
            >
              {going ? 'You are going' : waiting ? 'On the waitlist' : isFull(event) ? 'Join waitlist' : "I'm in"}
            </button>
            <button
              type="button"
              onClick={() => onOpen(event)}
              className="flex items-center gap-1.5 rounded-md border border-nt-0/30 px-4 py-2 text-[0.8125rem] text-nt-0 transition-colors duration-[180ms] hover:bg-nt-0/15"
            >
              Details
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
