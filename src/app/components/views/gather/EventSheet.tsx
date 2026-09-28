import { useId } from 'react';
import { CalendarDays, Clock, MapPin, Tag, UserRound, Users, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { formatDay, initials } from '../../../lib/format';
import { PEOPLE } from '../../../lib/seed';
import type { GatherEvent } from '../../../lib/data';
import {
  CATEGORY_ICON,
  CATEGORY_TONE,
  isFull,
  isGoing,
  isPast,
  isWaiting,
  lengthLabel,
  priceLabel,
  seatsLeft,
} from './events';

const roleOf = (name: string): string => PEOPLE.find((person) => person.name === name)?.role ?? '';

interface EventSheetProps {
  event: GatherEvent;
  me: string;
  readOnly?: boolean;
  onClose: () => void;
  onToggle?: (event: GatherEvent) => void;
}

export function EventSheet({ event, me, readOnly, onClose, onToggle }: EventSheetProps) {
  const titleId = useId();
  const Icon = CATEGORY_ICON[event.category];
  const tone = CATEGORY_TONE[event.category];
  const going = isGoing(event, me);
  const waiting = isWaiting(event, me);
  const past = isPast(event);
  const left = seatsLeft(event);
  const filled = Math.min(Math.round((event.going.length / event.capacity) * 100), 100);

  const facts = [
    { icon: CalendarDays, label: `${formatDay(event.date)} · ${event.date}` },
    { icon: Clock, label: `${event.start}–${event.end} · ${lengthLabel(event.start, event.end)}` },
    { icon: MapPin, label: event.location },
    { icon: UserRound, label: `${event.host} · ${event.team}` },
    { icon: Tag, label: `${event.category} · ${event.mode} · ${priceLabel(event.price)}` },
  ];

  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="dx-card relative flex w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className={cn('relative shrink-0 bg-gradient-to-br px-6 py-6', tone.wash)}>
          <Icon
            size={150}
            aria-hidden="true"
            className="absolute -right-8 -top-10 text-nt-0/15"
          />
          <div className="relative pr-10">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-nt-0/75">
              {event.category}
              {event.required && ' · attendance expected'}
            </p>
            <h2 id={titleId} className="mt-1.5 text-[1.375rem] font-medium leading-tight text-nt-0">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-nt-0/15 text-nt-0 transition-colors duration-[180ms] hover:bg-nt-0/25"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <p className="text-body text-ink">{event.summary}</p>

          <ul className="grid gap-2.5 sm:grid-cols-2">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-start gap-2 text-[0.8125rem] text-ink-muted">
                <fact.icon size={14} className="mt-0.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                <span>{fact.label}</span>
              </li>
            ))}
          </ul>

          {event.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {event.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-nt-50 px-2.5 py-1 text-[0.6875rem] text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="dx-eyebrow">Who is coming</h3>
              <span className="text-[0.6875rem] tabular-nums text-ink-muted">
                {event.going.length} of {event.capacity}
              </span>
            </div>
            <span className="mb-3 block h-1.5 overflow-hidden rounded-full bg-nt-100" aria-hidden="true">
              <span
                style={{ width: `${filled}%` }}
                className={cn('block h-full rounded-full', tone.bar)}
              />
            </span>

            <ul className="grid gap-2 sm:grid-cols-2">
              {event.going.map((person) => (
                <li key={person} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
                  >
                    {initials(person)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8125rem] text-ink">
                      {person}
                      {person === me && ' (you)'}
                    </span>
                    <span className="block truncate text-[0.6875rem] text-ink-subtle">
                      {roleOf(person)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {event.waitlist.length > 0 && (
            <div>
              <h3 className="dx-eyebrow mb-2">Waiting for a seat</h3>
              <ol className="space-y-1.5">
                {event.waitlist.map((person, index) => (
                  <li key={person} className="flex items-center gap-2.5 text-[0.8125rem] text-ink-muted">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] tabular-nums">
                      {index + 1}
                    </span>
                    {person}
                    {person === me && ' (you)'}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
          <p className="flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
            <Users size={13} aria-hidden="true" />
            {past
              ? 'This one has wrapped.'
              : left === 0
                ? `Full — ${event.waitlist.length} waiting`
                : `${left} seat${left === 1 ? '' : 's'} left`}
          </p>

          {!past && !readOnly && onToggle && (
            <button
              type="button"
              onClick={() => onToggle(event)}
              className={cn(going || waiting ? 'dx-btn-secondary' : 'dx-btn-primary')}
            >
              {going
                ? "Can't make it"
                : waiting
                  ? 'Leave the waitlist'
                  : isFull(event)
                    ? 'Join the waitlist'
                    : 'Count me in'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
