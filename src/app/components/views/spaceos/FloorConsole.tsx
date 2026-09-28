import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Trash2, Wrench, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { bookings as bookingsCol, spaces as spacesCol } from '../../../lib/data';
import { formatDay, todayKey } from '../../../lib/format';
import type { Booking, Space } from '../../../lib/data';
import { BookDialog } from './BookDialog';
import type { Draft } from './BookDialog';
import { Schedule } from './Schedule';
import { SpaceDialog } from './SpaceDialog';
import type { SpaceDraft } from './SpaceDialog';
import { SpaceGrid } from './SpaceGrid';
import { Toolbar } from './Toolbar';
import type { View } from './Toolbar';
import {
  DAY_START,
  KIND_ICON,
  NO_FILTERS,
  addMinutes,
  byLevelThenName,
  clockNow,
  holdsSpace,
  levelsOf,
  matchesFilters,
  toClock,
  toMinutes,
} from './spaces';
import type { Filters } from './spaces';

const FACILITIES = 'Facilities';

export function FloorConsole() {
  const allSpaces = useCollection(spacesCol);
  const allBookings = useCollection(bookingsCol);

  const [date, setDate] = useState(todayKey);
  const [view, setView] = useState<View>('timeline');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [addingSpace, setAddingSpace] = useState(false);

  const live = date === todayKey();
  const reference = live ? clockNow() : toClock(DAY_START * 60);

  const shown = useMemo(
    () => allSpaces.filter((space) => matchesFilters(space, filters)).sort(byLevelThenName),
    [allSpaces, filters],
  );

  const ranked = useMemo(() => [...allSpaces].sort(byLevelThenName), [allSpaces]);

  const pending = useMemo(
    () =>
      allBookings
        .filter((booking) => booking.status === 'pending')
        .sort((a, b) => a.date.localeCompare(b.date) || toMinutes(a.start) - toMinutes(b.start)),
    [allBookings],
  );

  const offline = allSpaces.filter((space) => space.offline);
  const utilisation =
    allSpaces.length === 0
      ? 0
      : Math.round(allSpaces.reduce((sum, space) => sum + space.utilisation, 0) / allSpaces.length);

  const closeBooking = () => {
    setDraft(null);
    setEditingBooking(null);
  };

  const openSlot = (space: Space, start: string) => {
    setEditingBooking(null);
    setDraft({
      spaceId: space.id,
      date,
      start,
      end: addMinutes(start, 60),
      purpose: '',
      attendees: 1,
    });
  };

  const saveBooking = (next: Draft, space: Space, target: Booking | null) => {
    const shape = {
      spaceId: space.id,
      space: space.name,
      level: space.level,
      capacity: space.capacity,
      date: next.date,
      start: next.start,
      end: next.end,
      purpose: next.purpose.trim(),
      attendees: next.attendees,
    };

    if (target) {
      bookingsCol.update(target.id, shape);
      toast.success('Booking moved', { description: `${shape.space} · ${shape.start}–${shape.end}` });
    } else {
      bookingsCol.create({ ...shape, organizer: FACILITIES, status: 'confirmed' });
      setDate(next.date);
      toast.success(`${space.name} blocked`, {
        description: `${formatDay(next.date)} · ${shape.start}–${shape.end}`,
      });
    }

    closeBooking();
  };

  const decide = (booking: Booking, approved: boolean) => {
    bookingsCol.update(booking.id, { status: approved ? 'confirmed' : 'declined' });
    toast.success(approved ? `${booking.space} approved` : `${booking.space} declined`, {
      description: `${booking.organizer} · ${booking.start}–${booking.end}`,
      action: {
        label: 'Undo',
        onClick: () => bookingsCol.update(booking.id, { status: 'pending' }),
      },
    });
  };

  const saveSpace = (next: SpaceDraft, target: Space | null) => {
    const shape = {
      name: next.name.trim(),
      kind: next.kind,
      level: next.level.trim(),
      capacity: next.capacity,
      amenities: next.amenities,
      approval: next.approval,
      offline: next.offline,
      note: next.offline ? next.note.trim() : undefined,
    };

    if (target) {
      spacesCol.update(target.id, shape);
      toast.success(`${shape.name} updated`);
    } else {
      spacesCol.create({ ...shape, utilisation: 0 });
      toast.success(`${shape.name} is bookable`, { description: `${shape.level} · seats ${shape.capacity}` });
    }

    setEditingSpace(null);
    setAddingSpace(false);
  };

  const toggleOffline = (space: Space) => {
    if (!space.offline) {
      setEditingSpace(space);
      return;
    }
    spacesCol.update(space.id, { offline: false, note: undefined });
    toast.success(`${space.name} is back`, { description: 'People can book it again.' });
  };

  const removeSpace = (space: Space) => {
    const held = allBookings.filter(
      (booking) => booking.spaceId === space.id && holdsSpace(booking) && booking.date >= todayKey(),
    );

    if (held.length > 0) {
      toast.error(`${space.name} still has ${held.length} booking${held.length === 1 ? '' : 's'}`, {
        description: 'Release them first, or take the space offline instead.',
      });
      return;
    }

    spacesCol.remove(space.id);
    toast.success(`${space.name} removed`);
  };

  const stats = [
    { label: 'Average utilisation', value: utilisation, suffix: '%', tone: 'brand' as const },
    { label: 'Waiting on you', value: pending.length, tone: 'green' as const },
    { label: 'Spaces offline', value: offline.length, tone: 'neutral' as const },
  ];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">SpaceOS · Floor operations</p>
          <h2 className="dx-h2 text-balance">How the building is actually used.</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Approve what needs you, block what needs work, and see every level at once.
          </p>
        </div>
        <button type="button" onClick={() => setAddingSpace(true)} className="dx-btn-primary">
          <Plus size={15} aria-hidden="true" />
          Add a space
        </button>
      </div>

      <section aria-label="The estate at a glance" className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <p
              className={cn(
                'text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'green' && 'text-grn-500',
                stat.tone === 'neutral' && 'text-ink',
              )}
            >
              <CountUp value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {pending.length > 0 && (
        <section aria-labelledby="approvals-heading" className="dx-card mb-5 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h3 id="approvals-heading" className="dx-eyebrow">
              Waiting for approval
            </h3>
          </div>
          <ul className="divide-y divide-line">
            {pending.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-medium text-ink">{booking.purpose}</p>
                  <p className="truncate text-[0.75rem] text-ink-muted">
                    {booking.organizer} · {booking.space} · {formatDay(booking.date)} {booking.start}–
                    {booking.end} · {booking.attendees} people
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => decide(booking, false)}
                    className="dx-btn-secondary px-3 py-1.5 text-[0.8125rem] hover:border-danger/40 hover:text-danger"
                  >
                    <X size={14} aria-hidden="true" />
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(booking, true)}
                    className="dx-btn-primary px-3 py-1.5 text-[0.8125rem]"
                  >
                    <Check size={14} aria-hidden="true" />
                    Approve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="floor-heading" className="dx-card mb-5 min-w-0 overflow-hidden">
        <h3 id="floor-heading" className="sr-only">
          Every space, hour by hour
        </h3>

        <Toolbar
          date={date}
          onDate={setDate}
          view={view}
          onView={setView}
          filters={filters}
          onFilters={setFilters}
          levels={levelsOf(allSpaces)}
        />

        {shown.length === 0 ? (
          <div className="grid min-h-[16rem] place-items-center px-6 text-center">
            <div>
              <p className="text-body text-ink">No space matches that.</p>
              <button type="button" onClick={() => setFilters(NO_FILTERS)} className="dx-btn-ghost mt-3">
                Clear the filters
              </button>
            </div>
          </div>
        ) : view === 'timeline' ? (
          <Schedule
            spaces={shown}
            bookings={allBookings}
            date={date}
            live={live}
            mine={FACILITIES}
            onPickSlot={openSlot}
            onOpenBooking={setEditingBooking}
          />
        ) : (
          <SpaceGrid spaces={shown} bookings={allBookings} date={date} live={live} onBook={openSlot} />
        )}
      </section>

      <section aria-labelledby="estate-heading" className="dx-card overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h3 id="estate-heading" className="dx-eyebrow">
            Every space you run
          </h3>
        </div>

        <ul className="divide-y divide-line">
          {ranked.map((space) => {
            const Icon = KIND_ICON[space.kind];
            return (
              <li key={space.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nt-100 text-ink-muted"
                >
                  <Icon size={15} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-medium text-ink">
                    {space.name}
                    {space.approval && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] font-medium text-brand-700">
                        Approval
                      </span>
                    )}
                    {space.offline && (
                      <span className="ml-2 rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] font-medium text-ink-subtle">
                        Offline
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[0.75rem] text-ink-muted">
                    {space.level} · {space.kind} · seats {space.capacity}
                    {space.offline && space.note ? ` · ${space.note}` : ''}
                  </p>
                </div>

                <div className="flex w-28 shrink-0 items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-nt-100" aria-hidden="true">
                    <span
                      style={{ width: `${space.utilisation}%` }}
                      className={cn(
                        'block h-full rounded-full',
                        space.utilisation > 75 ? 'bg-warning' : 'bg-brand-400',
                      )}
                    />
                  </span>
                  <span className="text-[0.6875rem] tabular-nums text-ink-subtle">
                    {space.utilisation}%
                  </span>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => toggleOffline(space)}
                    aria-label={space.offline ? `Bring ${space.name} back` : `Take ${space.name} offline`}
                    className={cn('dx-btn-ghost px-2', space.offline && 'text-warning')}
                  >
                    <Wrench size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSpace(space)}
                    aria-label={`Edit ${space.name}`}
                    className="dx-btn-ghost px-2"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSpace(space)}
                    aria-label={`Remove ${space.name}`}
                    className="dx-btn-ghost px-2 hover:bg-danger-bg hover:text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {(draft || editingBooking) && (
        <BookDialog
          spaces={allSpaces}
          bookings={allBookings}
          editing={editingBooking}
          initial={
            draft ?? {
              spaceId: '',
              date,
              start: reference,
              end: addMinutes(reference, 60),
              purpose: '',
              attendees: 1,
            }
          }
          onClose={closeBooking}
          onSave={saveBooking}
        />
      )}

      {(addingSpace || editingSpace) && (
        <SpaceDialog
          editing={editingSpace}
          levels={levelsOf(allSpaces)}
          taken={allSpaces
            .filter((space) => space.id !== editingSpace?.id)
            .map((space) => space.name.toLowerCase())}
          onClose={() => {
            setAddingSpace(false);
            setEditingSpace(null);
          }}
          onSave={saveSpace}
        />
      )}
    </>
  );
}
