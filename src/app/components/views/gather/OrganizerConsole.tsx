import { useMemo, useState } from 'react';
import { CalendarPlus, Pencil, Send, Trash2, Undo2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import {
  bookings as bookingsCol,
  events as eventsCol,
  spaces as spacesCol,
} from '../../../lib/data';
import { formatDay, initials, todayKey } from '../../../lib/format';
import { PEOPLE } from '../../../lib/seed';
import type { GatherEvent } from '../../../lib/data';
import { EventDialog, draftFrom, emptyDraft } from './EventDialog';
import type { Draft } from './EventDialog';
import { EventSheet } from './EventSheet';
import {
  CATEGORY_TONE,
  STATUS_TONE,
  byWhen,
  isPast,
  lengthLabel,
  promote,
  seatsLeft,
} from './events';

type Lens = 'upcoming' | 'drafts' | 'past';

const LENSES: Array<{ id: Lens; label: string }> = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'past', label: 'Past' },
];

export function OrganizerConsole() {
  const all = useCollection(eventsCol);
  const allSpaces = useCollection(spacesCol);
  const allBookings = useCollection(bookingsCol);

  const [lens, setLens] = useState<Lens>('upcoming');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<GatherEvent | null>(null);
  const [viewing, setViewing] = useState<GatherEvent | null>(null);

  const shown = useMemo(() => {
    const rows = [...all].sort(byWhen);
    if (lens === 'drafts') return rows.filter((event) => event.status === 'draft');
    if (lens === 'past') return rows.filter((event) => isPast(event)).reverse();
    return rows.filter((event) => !isPast(event) && event.status !== 'draft');
  }, [all, lens]);

  const waiting = useMemo(
    () =>
      all
        .filter((event) => !isPast(event) && event.waitlist.length > 0)
        .sort(byWhen)
        .flatMap((event) => event.waitlist.map((person) => ({ event, person }))),
    [all],
  );

  const liveUpcoming = all.filter((event) => !isPast(event) && event.status === 'published');
  const signups = liveUpcoming.reduce((total, event) => total + event.going.length, 0);

  const stats = [
    { label: 'Events on the board', value: liveUpcoming.length, tone: 'brand' as const },
    { label: 'Seats taken', value: signups, tone: 'green' as const },
    { label: 'Waiting on a seat', value: waiting.length, tone: 'neutral' as const },
  ];

  const syncHold = (event: GatherEvent) => {
    const existing = allBookings.find((booking) => booking.eventId === event.id);

    if (event.status !== 'published' || !event.spaceId) {
      if (existing) bookingsCol.remove(existing.id);
      return;
    }

    const space = allSpaces.find((row) => row.id === event.spaceId);
    if (!space) return;

    const shape = {
      spaceId: space.id,
      space: space.name,
      level: space.level,
      capacity: space.capacity,
      date: event.date,
      start: event.start,
      end: event.end,
      purpose: event.title,
      organizer: event.host,
      attendees: event.going.length,
      eventId: event.id,
    };

    if (existing) bookingsCol.update(existing.id, shape);
    else bookingsCol.create({ ...shape, status: 'confirmed' });
  };

  const save = (next: Draft, target: GatherEvent | null) => {
    const shape = {
      title: next.title.trim(),
      category: next.category,
      mode: next.mode,
      date: next.date,
      start: next.start,
      end: next.end,
      spaceId: next.spaceId || undefined,
      location: next.location.trim(),
      host: next.host,
      team: PEOPLE.find((person) => person.name === next.host)?.team ?? 'Workplace',
      capacity: next.capacity,
      price: next.price,
      required: next.required,
      summary: next.summary.trim(),
      tags: next.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (target) {
      const updated = eventsCol.update(target.id, shape);
      if (updated) syncHold(updated);
      toast.success(`${shape.title} updated`, {
        description: `${formatDay(shape.date)} · ${shape.start}–${shape.end}`,
      });
    } else {
      const created = eventsCol.create({
        ...shape,
        going: [],
        waitlist: [],
        status: 'draft',
      });
      setLens('drafts');
      toast.success(`${shape.title} saved as a draft`, {
        description: 'Publish it when you are ready for sign-ups.',
        action: {
          label: 'Publish now',
          onClick: () => publish(created),
        },
      });
    }

    setDraft(null);
    setEditing(null);
  };

  const publish = (event: GatherEvent) => {
    const updated = eventsCol.update(event.id, { status: 'published' });
    if (updated) syncHold(updated);
    setLens('upcoming');
    toast.success(`${event.title} is live`, {
      description: event.spaceId
        ? `${event.location} is now held in SpaceOS.`
        : 'People can sign up from Gather.',
      action: {
        label: 'Undo',
        onClick: () => {
          const reverted = eventsCol.update(event.id, { status: 'draft' });
          if (reverted) syncHold(reverted);
        },
      },
    });
  };

  const cancel = (event: GatherEvent) => {
    const updated = eventsCol.update(event.id, { status: 'cancelled' });
    if (updated) syncHold(updated);
    toast.success(`${event.title} cancelled`, {
      description: `${event.going.length} people told, and the room is released.`,
      action: {
        label: 'Undo',
        onClick: () => {
          const reverted = eventsCol.update(event.id, { status: 'published' });
          if (reverted) syncHold(reverted);
        },
      },
    });
  };

  const remove = (event: GatherEvent) => {
    if (event.going.length > 0 && event.status === 'published') {
      toast.error(`${event.title} still has ${event.going.length} people signed up`, {
        description: 'Cancel it first so everyone gets told.',
      });
      return;
    }

    const hold = allBookings.find((booking) => booking.eventId === event.id);
    if (hold) bookingsCol.remove(hold.id);
    eventsCol.remove(event.id);
    toast.success(`${event.title} deleted`);
  };

  const lift = (event: GatherEvent, person: string) => {
    const before = { going: event.going, waitlist: event.waitlist };
    const updated = eventsCol.update(event.id, promote(event, person));
    if (updated) syncHold(updated);
    toast.success(`${person} is in`, {
      description: `${event.title} · ${formatDay(event.date)}`,
      action: { label: 'Undo', onClick: () => eventsCol.update(event.id, before) },
    });
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">Gather · programme</p>
          <h2 className="dx-h2 text-balance">What the building is running</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Every event, who is coming, and the rooms they are holding.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDraft(emptyDraft(todayKey()));
          }}
          className="dx-btn-primary"
        >
          <CalendarPlus size={15} aria-hidden="true" />
          Host something
        </button>
      </div>

      <section aria-label="Programme at a glance" className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <CountUp
              value={stat.value}
              className={cn(
                'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'green' && 'text-grn-500',
                stat.tone === 'neutral' && 'text-ink',
              )}
            />
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <section aria-labelledby="programme-heading" className="dx-card min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 border-b border-line px-4 py-3">
            <h3 id="programme-heading" className="sr-only">
              The programme
            </h3>
            {LENSES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={lens === entry.id}
                onClick={() => setLens(entry.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[0.8125rem] transition-colors duration-[180ms]',
                  lens === entry.id
                    ? 'bg-nt-100 font-medium text-ink'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="px-6 py-12 text-center text-[0.8125rem] text-ink-muted">
              Nothing here yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {shown.map((event) => {
                const tone = CATEGORY_TONE[event.category];
                const status = STATUS_TONE[event.status];
                const left = seatsLeft(event);

                return (
                  <li key={event.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone.bar)}
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setViewing(event)}
                          className="block max-w-full truncate text-left text-[0.875rem] font-medium text-ink hover:text-brand-700"
                        >
                          {event.title}
                        </button>
                        <p className="truncate text-[0.75rem] text-ink-muted">
                          {formatDay(event.date)} · {event.start}–{event.end} ·{' '}
                          {lengthLabel(event.start, event.end)} · {event.location}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
                          status.chip,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-5">
                      <span className="flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                        <Users size={11} aria-hidden="true" />
                        {event.going.length}/{event.capacity}
                        {left === 0 && ' · full'}
                      </span>
                      {event.waitlist.length > 0 && (
                        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[0.625rem] font-medium text-warning">
                          {event.waitlist.length} waiting
                        </span>
                      )}
                      {event.spaceId && event.status === 'published' && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] text-brand-700">
                          Room held
                        </span>
                      )}

                      <span className="ml-auto flex items-center gap-1">
                        {event.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => publish(event)}
                            className="dx-btn-ghost px-2 py-1 text-[0.75rem]"
                          >
                            <Send size={12} aria-hidden="true" />
                            Publish
                          </button>
                        )}
                        {event.status === 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => publish(event)}
                            className="dx-btn-ghost px-2 py-1 text-[0.75rem]"
                          >
                            <Undo2 size={12} aria-hidden="true" />
                            Restore
                          </button>
                        )}
                        {event.status === 'published' && !isPast(event) && (
                          <button
                            type="button"
                            onClick={() => cancel(event)}
                            className="dx-btn-ghost px-2 py-1 text-[0.75rem]"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(event);
                            setDraft(draftFrom(event));
                          }}
                          aria-label={`Edit ${event.title}`}
                          className="dx-btn-ghost px-2 py-1"
                        >
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(event)}
                          aria-label={`Delete ${event.title}`}
                          className="dx-btn-ghost px-2 py-1 hover:bg-danger-bg hover:text-danger"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section aria-labelledby="waitlist-heading" className="dx-card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h3 id="waitlist-heading" className="dx-eyebrow">
                Waiting on a seat
              </h3>
            </div>

            {waiting.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.8125rem] text-ink-muted">
                Nobody is queuing. Every event has room.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {waiting.map(({ event, person }) => (
                  <li key={`${event.id}-${person}`} className="flex items-start gap-3 px-5 py-3.5">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
                    >
                      {initials(person)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8125rem] font-medium text-ink">{person}</p>
                      <p className="truncate text-[0.75rem] text-ink-muted">{event.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => lift(event, person)}
                      aria-label={`Give ${person} a seat at ${event.title}`}
                      className="dx-btn-ghost shrink-0 px-2 py-1 text-[0.75rem]"
                    >
                      <UserPlus size={12} aria-hidden="true" />
                      Let in
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {draft && (
        <EventDialog
          spaces={allSpaces}
          bookings={allBookings}
          editing={editing}
          initial={draft}
          onClose={() => {
            setDraft(null);
            setEditing(null);
          }}
          onSave={save}
        />
      )}

      {viewing && (
        <EventSheet event={viewing} me={viewing.host} readOnly onClose={() => setViewing(null)} />
      )}
    </>
  );
}
