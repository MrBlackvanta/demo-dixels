import { useMemo, useState } from 'react';
import { CalendarPlus, LogIn, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, bookings as bookingsCol, spaces as spacesCol } from '../../../lib/data';
import { formatDay, todayKey } from '../../../lib/format';
import type { Booking, Space } from '../../../lib/data';
import { BookDialog } from './BookDialog';
import type { Draft } from './BookDialog';
import { FindDialog } from './FindDialog';
import { Schedule } from './Schedule';
import { SpaceGrid } from './SpaceGrid';
import { Toolbar } from './Toolbar';
import type { View } from './Toolbar';
import {
  DAY_START,
  NO_FILTERS,
  STATUS,
  addMinutes,
  availabilityAt,
  bookingsFor,
  byLevelThenName,
  clockNow,
  holdsSpace,
  levelsOf,
  matchesFilters,
  toClock,
  toMinutes,
} from './spaces';
import type { Filters, Suggestion } from './spaces';

export function BookingConsole() {
  const allSpaces = useCollection(spacesCol);
  const allBookings = useCollection(bookingsCol);

  const [date, setDate] = useState(todayKey);
  const [view, setView] = useState<View>('timeline');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [finding, setFinding] = useState(false);

  const live = date === todayKey();
  const reference = live ? clockNow() : toClock(DAY_START * 60);

  const shown = useMemo(
    () => allSpaces.filter((space) => matchesFilters(space, filters)).sort(byLevelThenName),
    [allSpaces, filters],
  );

  const mine = useMemo(
    () =>
      allBookings
        .filter(
          (booking) =>
            booking.organizer === CURRENT_USER.name && booking.date === date && holdsSpace(booking),
        )
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
    [allBookings, date],
  );

  const inUse = allSpaces.filter(
    (space) => !space.offline && !availabilityAt(bookingsFor(allBookings, space.id, date), reference).free,
  ).length;

  const bookable = allSpaces.filter((space) => !space.offline).length;

  const stats = [
    { label: live ? 'Free right now' : 'Free at opening', value: bookable - inUse, tone: 'green' as const },
    { label: 'Spaces in use', value: inUse, tone: 'brand' as const },
    { label: 'Your holds', value: mine.length, tone: 'neutral' as const },
  ];

  const openSlot = (space: Space, start: string) => {
    setEditing(null);
    setDraft({
      spaceId: space.id,
      date,
      start,
      end: addMinutes(start, 60),
      purpose: '',
      attendees: Math.min(space.capacity, 4),
    });
  };

  const openSuggestion = (suggestion: Suggestion) => {
    setFinding(false);
    setEditing(null);
    setDraft({
      spaceId: suggestion.space.id,
      date,
      start: suggestion.start,
      end: suggestion.end,
      purpose: '',
      attendees: Math.min(suggestion.space.capacity, 4),
    });
  };

  const close = () => {
    setDraft(null);
    setEditing(null);
  };

  const save = (next: Draft, space: Space, target: Booking | null) => {
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
      toast.success('Booking moved', {
        description: `${shape.space} · ${shape.start}–${shape.end}`,
      });
    } else {
      bookingsCol.create({
        ...shape,
        organizer: CURRENT_USER.name,
        status: space.approval ? 'pending' : 'confirmed',
      });
      setDate(next.date);
      toast.success(space.approval ? 'Request sent' : `${space.name} is yours`, {
        description: space.approval
          ? `Facilities will confirm ${shape.start}–${shape.end}.`
          : `${formatDay(next.date)} · ${shape.start}–${shape.end}`,
      });
    }

    close();
  };

  const checkIn = (booking: Booking) => {
    bookingsCol.update(booking.id, { status: 'checked-in', checkedInAt: new Date().toISOString() });
    toast.success(`Checked in to ${booking.space}`, { description: 'The room is set to your comfort profile.' });
  };

  const release = (booking: Booking) => {
    const previous = booking.status;
    bookingsCol.update(booking.id, { status: 'cancelled' });
    toast.success(`${booking.space} released`, {
      description: `${booking.start}–${booking.end} is open again.`,
      action: {
        label: 'Undo',
        onClick: () => bookingsCol.update(booking.id, { status: previous }),
      },
    });
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">SpaceOS · {CURRENT_USER.building}</p>
          <h2 className="dx-h2 text-balance">Where do you want to work today?</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Every room and desk in the building, live. Click a gap and it is yours.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setFinding(true)} className="dx-btn-secondary">
            <Sparkles size={15} aria-hidden="true" />
            Find me a space
          </button>
          <button
            type="button"
            onClick={() => openSlot(shown[0] ?? allSpaces[0], reference)}
            disabled={allSpaces.length === 0}
            className="dx-btn-primary"
          >
            <CalendarPlus size={15} aria-hidden="true" />
            Hold a space
          </button>
        </div>
      </div>

      <section aria-label="The building at a glance" className="mb-5 grid grid-cols-3 gap-3">
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
        <section aria-labelledby="schedule-heading" className="dx-card min-w-0 overflow-hidden">
          <h3 id="schedule-heading" className="sr-only">
            The building schedule
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
            <div className="grid min-h-[18rem] place-items-center px-6 text-center">
              <div>
                <CalendarPlus size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
                <p className="text-body text-ink">Nothing in the building matches that.</p>
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="dx-btn-ghost mt-3"
                >
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
              mine={CURRENT_USER.name}
              onPickSlot={openSlot}
              onOpenBooking={(booking) => setEditing(booking)}
            />
          ) : (
            <SpaceGrid
              spaces={shown}
              bookings={allBookings}
              date={date}
              live={live}
              onBook={openSlot}
            />
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section aria-labelledby="mine-heading" className="dx-card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h3 id="mine-heading" className="dx-eyebrow">
                Your {formatDay(date).toLowerCase()}
              </h3>
            </div>

            {mine.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.8125rem] text-ink-muted">
                Nothing held. Pick a gap in the grid and it is yours.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {mine.map((booking) => {
                  const tone = STATUS[booking.status];
                  return (
                    <li key={booking.id} className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="w-11 shrink-0 text-[0.8125rem] font-medium tabular-nums text-ink">
                          {booking.start}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8125rem] font-medium text-ink">
                            {booking.purpose}
                          </p>
                          <p className="truncate text-[0.75rem] text-ink-muted">
                            {booking.space} · {booking.level}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-14">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
                            tone.chip,
                          )}
                        >
                          {tone.label}
                        </span>

                        {booking.status === 'confirmed' && live && (
                          <button
                            type="button"
                            onClick={() => checkIn(booking)}
                            className="dx-btn-ghost px-2 py-1 text-[0.75rem]"
                          >
                            <LogIn size={13} aria-hidden="true" />
                            Check in
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditing(booking)}
                          aria-label={`Move ${booking.purpose}`}
                          className="dx-btn-ghost ml-auto px-2 py-1"
                        >
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => release(booking)}
                          aria-label={`Release ${booking.space}`}
                          className="dx-btn-ghost px-2 py-1 hover:bg-danger-bg hover:text-danger"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {(draft || editing) && (
        <BookDialog
          spaces={allSpaces}
          bookings={allBookings}
          editing={editing}
          initial={
            draft ?? {
              spaceId: '',
              date,
              start: reference,
              end: addMinutes(reference, 60),
              purpose: '',
              attendees: 2,
            }
          }
          onClose={close}
          onSave={save}
        />
      )}

      {finding && (
        <FindDialog
          spaces={allSpaces}
          bookings={allBookings}
          date={date}
          onClose={() => setFinding(false)}
          onPick={openSuggestion}
        />
      )}
    </>
  );
}
