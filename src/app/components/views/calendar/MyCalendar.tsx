import { useMemo, useState } from 'react';
import { CalendarDays, CalendarRange, List, Plus, SearchX, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import {
  CURRENT_USER,
  bookings as bookingsCol,
  meetings as meetingsCol,
  spaces as spacesCol,
  tasks as tasksCol,
} from '../../../lib/data';
import { PEOPLE } from '../../../lib/seed';
import { addMinutes, duration, shiftDay, todayKey } from '../../../lib/format';
import {
  answerWith,
  byStart,
  clashesFor,
  freeInWorkday,
  gapsFor,
  holdsTime,
  isOnInvite,
  lengthOf,
  monthLabel,
  nextSlot,
  nowMinutes,
  rangeLabel,
  relativeDay,
  roomHolder,
  weekOf,
} from '../../../lib/agenda';
import type { Slot } from '../../../lib/agenda';
import type { Booking, Meeting, Rsvp } from '../../../lib/data';
import { AgendaList } from './AgendaList';
import { DayGrid } from './DayGrid';
import { DayRail } from './DayRail';
import { FindTimeDialog } from './FindTimeDialog';
import { MeetingSheet } from './MeetingSheet';
import { NewMeetingDialog } from './NewMeetingDialog';
import type { Draft } from './NewMeetingDialog';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { NO_FILTERS, matchesFilters, seats } from './dayplan';
import type { Filters } from './dayplan';
import { WeekGrid } from './WeekGrid';

const me = CURRENT_USER.name;
const AGENDA_DAYS = 14;

const LENSES: Lens[] = [
  { id: 'day', label: 'Day', icon: CalendarDays },
  { id: 'week', label: 'Week', icon: CalendarRange },
  { id: 'agenda', label: 'Agenda', icon: List },
];

export function MyCalendar() {
  const all = useCollection(meetingsCol);
  const bookings = useCollection(bookingsCol);
  const spaces = useCollection(spacesCol);
  const tasks = useCollection(tasksCol);

  const [lens, setLens] = useState('day');
  const [date, setDate] = useState(todayKey());
  const [filters, setFilters] = useState<Filters>({ ...NO_FILTERS, mineOnly: true });
  const [openId, setOpenId] = useState<string | null>(null);
  const [seed, setSeed] = useState<{ date: string; start: string } | null>(null);
  const [finding, setFinding] = useState(false);
  const [dragged, setDragged] = useState<Meeting | null>(null);

  const open = openId === null ? undefined : all.find((meeting) => meeting.id === openId);

  const people = useMemo(() => PEOPLE.map((person) => person.name).sort((a, b) => a.localeCompare(b)), []);

  const week = useMemo(() => weekOf(date), [date]);
  const agendaDays = useMemo(
    () => Array.from({ length: AGENDA_DAYS }, (_, i) => shiftDay(date, i)),
    [date],
  );

  const shown = useMemo(
    () => all.filter((meeting) => matchesFilters(meeting, filters, me)),
    [all, filters],
  );

  const myGaps = useMemo(() => gapsFor(all, me, date), [all, date]);

  const todayRows = useMemo(
    () => all.filter((meeting) => meeting.date === todayKey() && isOnInvite(meeting, me)).sort(byStart),
    [all],
  );

  const clashCount = useMemo(
    () =>
      todayRows.filter(
        (meeting) =>
          holdsTime(meeting, me) &&
          clashesFor(all, [me], todayKey(), meeting.start, meeting.end, meeting.id).length > 0,
      ).length,
    [all, todayRows],
  );

  const awaiting = useMemo(
    () =>
      all.filter(
        (meeting) =>
          meeting.date >= todayKey() &&
          meeting.status !== 'cancelled' &&
          meeting.invitees.some((guest) => guest.name === me && guest.answer === 'pending'),
      ).length,
    [all],
  );

  const roomsFree = useMemo(() => {
    const clock = `${String(Math.floor(nowMinutes() / 60)).padStart(2, '0')}:${String(nowMinutes() % 60).padStart(2, '0')}`;
    const bookable = spaces.filter((space) => !space.offline && space.kind !== 'Desk');
    return bookable.filter(
      (space) =>
        roomHolder(bookings, space.id, todayKey(), clock, addMinutes(clock, 30)) === undefined,
    ).length;
  }, [spaces, bookings]);

  const stats = [
    { label: 'On your calendar today', value: todayRows.length, tone: 'brand' as const },
    { label: 'Clashing with each other', value: clashCount, tone: 'warning' as const },
    { label: 'Waiting on your answer', value: awaiting, tone: 'warning' as const },
    { label: 'Rooms free right now', value: roomsFree, tone: 'neutral' as const },
  ];

  const spaceName = (spaceId?: string): string =>
    spaces.find((row) => row.id === spaceId)?.name ?? 'the room';

  const refuse = (holder: Booking, spaceId: string) =>
    toast.error(`${spaceName(spaceId)} is already taken`, {
      description: `${holder.organizer} has it from ${holder.start} to ${holder.end} for ${holder.purpose}.`,
    });

  const answer = (meeting: Meeting, reply: Rsvp) => {
    const before = { invitees: meeting.invitees };
    const patch = answerWith(meeting, me, reply);
    const projected = all.map((row) => (row.id === meeting.id ? { ...row, ...patch } : row));
    const swing =
      freeInWorkday(projected, me, meeting.date) - freeInWorkday(all, me, meeting.date);
    const when = relativeDay(meeting.date).toLowerCase();

    meetingsCol.update(meeting.id, patch);

    toast.success(
      reply === 'no'
        ? `You are out of ${meeting.title}`
        : reply === 'maybe'
          ? `${meeting.title} is a maybe`
          : `You are going to ${meeting.title}`,
      {
        description:
          swing > 0
            ? `That gives ${duration(swing)} back to ${when}.`
            : swing < 0
              ? `That takes ${duration(-swing)} out of ${when}.`
              : `${meeting.start}–${meeting.end} ${when}, over something you are already in.`,
        action: { label: 'Undo', onClick: () => meetingsCol.update(meeting.id, before) },
      },
    );
  };

  const reschedule = (meeting: Meeting, toDate: string, start: string) => {
    const minutes = lengthOf(meeting);
    const end = addMinutes(start, minutes);

    if (meeting.spaceId) {
      const holder = roomHolder(bookings, meeting.spaceId, toDate, start, end, meeting.bookingId);
      if (holder) {
        refuse(holder, meeting.spaceId);
        return;
      }
    }

    const before = { date: meeting.date, start: meeting.start, end: meeting.end };
    const booking = bookings.find((row) => row.id === meeting.bookingId);
    const bookingBefore = booking
      ? { date: booking.date, start: booking.start, end: booking.end }
      : undefined;

    meetingsCol.update(meeting.id, { date: toDate, start, end });
    if (booking) bookingsCol.update(booking.id, { date: toDate, start, end });

    const people = [meeting.organizer, ...meeting.invitees.filter((g) => g.answer !== 'no').map((g) => g.name)];
    const bumped = clashesFor(all, people, toDate, start, end, meeting.id);

    toast.success(`${meeting.title} moved`, {
      description:
        bumped.length > 0
          ? `${relativeDay(toDate)} at ${start}, but ${bumped.length === 1 ? `${bumped[0].person.split(' ')[0]} is` : `${bumped.length} people are`} busy then.`
          : `${relativeDay(toDate)} at ${start} — everyone is still free.`,
      action: {
        label: 'Undo',
        onClick: () => {
          meetingsCol.update(meeting.id, before);
          if (booking && bookingBefore) bookingsCol.update(booking.id, bookingBefore);
        },
      },
    });
  };

  const changeRoom = (meeting: Meeting, spaceId: string) => {
    if (spaceId === (meeting.spaceId ?? '')) return;

    const booking = bookings.find((row) => row.id === meeting.bookingId);

    if (spaceId === '') {
      const before = { spaceId: meeting.spaceId, bookingId: meeting.bookingId, online: meeting.online };
      meetingsCol.update(meeting.id, { spaceId: undefined, bookingId: undefined, online: true });
      if (booking) bookingsCol.update(booking.id, { status: 'cancelled' });

      toast.success(`${meeting.title} is online now`, {
        description: booking ? `${booking.space} has been given back.` : 'No room needed.',
        action: {
          label: 'Undo',
          onClick: () => {
            meetingsCol.update(meeting.id, before);
            if (booking) bookingsCol.update(booking.id, { status: 'confirmed' });
          },
        },
      });
      return;
    }

    const holder = roomHolder(bookings, spaceId, meeting.date, meeting.start, meeting.end, meeting.bookingId);
    if (holder) {
      refuse(holder, spaceId);
      return;
    }

    const space = spaces.find((row) => row.id === spaceId);
    const before = { spaceId: meeting.spaceId, bookingId: meeting.bookingId, online: meeting.online };

    if (booking) {
      const bookingBefore = { spaceId: booking.spaceId, space: booking.space, level: booking.level, capacity: booking.capacity, status: booking.status };
      bookingsCol.update(booking.id, {
        spaceId,
        space: space?.name ?? '',
        level: space?.level ?? '',
        capacity: space?.capacity ?? 0,
        status: 'confirmed',
      });
      meetingsCol.update(meeting.id, { spaceId, online: false });

      toast.success(`Moved to ${space?.name}`, {
        description: `${space?.level} · ${seats(space?.capacity ?? 0)}.`,
        action: {
          label: 'Undo',
          onClick: () => {
            meetingsCol.update(meeting.id, before);
            bookingsCol.update(booking.id, bookingBefore);
          },
        },
      });
      return;
    }

    const made = bookingsCol.create({
      spaceId,
      space: space?.name ?? '',
      level: space?.level ?? '',
      capacity: space?.capacity ?? 0,
      date: meeting.date,
      start: meeting.start,
      end: meeting.end,
      purpose: meeting.title,
      status: 'confirmed',
      organizer: meeting.organizer,
      attendees: meeting.invitees.length + 1,
    });
    meetingsCol.update(meeting.id, { spaceId, bookingId: made.id, online: false });

    toast.success(`${space?.name} is held`, {
      description: `${space?.level} · booked through SpaceOS.`,
      action: {
        label: 'Undo',
        onClick: () => {
          meetingsCol.update(meeting.id, before);
          bookingsCol.remove(made.id);
        },
      },
    });
  };

  const cancel = (meeting: Meeting) => {
    const booking = bookings.find((row) => row.id === meeting.bookingId);
    const freed = meeting.invitees.filter((guest) => guest.answer !== 'no').length;

    meetingsCol.update(meeting.id, { status: 'cancelled' });
    if (booking) bookingsCol.update(booking.id, { status: 'cancelled' });
    setOpenId(null);

    toast.success(`${meeting.title} is off`, {
      description: booking
        ? `${booking.space} is free again, and ${duration(lengthOf(meeting))} goes back to ${freed} ${freed === 1 ? 'person' : 'people'}.`
        : `${duration(lengthOf(meeting))} goes back to ${freed} ${freed === 1 ? 'person' : 'people'}.`,
      action: {
        label: 'Undo',
        onClick: () => {
          meetingsCol.update(meeting.id, { status: 'confirmed' });
          if (booking) bookingsCol.update(booking.id, { status: 'confirmed' });
        },
      },
    });
  };

  const create = (draft: Draft) => {
    const end = addMinutes(draft.start, draft.length);
    const space = spaces.find((row) => row.id === draft.spaceId);

    if (space) {
      const holder = roomHolder(bookings, space.id, draft.date, draft.start, end);
      if (holder) {
        refuse(holder, space.id);
        return;
      }
    }

    const booking = space
      ? bookingsCol.create({
          spaceId: space.id,
          space: space.name,
          level: space.level,
          capacity: space.capacity,
          date: draft.date,
          start: draft.start,
          end,
          purpose: draft.title,
          status: 'confirmed',
          organizer: me,
          attendees: draft.guests.length + 1,
        })
      : undefined;

    const made = meetingsCol.create({
      title: draft.title,
      agenda: draft.agenda || 'No agenda yet.',
      kind: draft.kind,
      date: draft.date,
      start: draft.start,
      end,
      organizer: me,
      invitees: draft.guests.map((name) => ({ name, answer: 'pending' as const, optional: false })),
      status: 'confirmed',
      online: space === undefined,
      spaceId: space?.id,
      bookingId: booking?.id,
    });

    const busy = clashesFor(all, draft.guests, draft.date, draft.start, end);

    setSeed(null);
    setDate(draft.date);
    toast.success(`${draft.title} is in`, {
      description:
        busy.length > 0
          ? `${space ? `${space.name}, ` : ''}${relativeDay(draft.date)} at ${draft.start} — ${busy.length} ${busy.length === 1 ? 'person was' : 'people were'} already busy.`
          : `${space ? `${space.name}, ` : 'Online, '}${relativeDay(draft.date)} at ${draft.start}.`,
      action: {
        label: 'Undo',
        onClick: () => {
          meetingsCol.remove(made.id);
          if (booking) bookingsCol.remove(booking.id);
        },
      },
    });
  };

  const protect = (onDate: string, start: string, minutes: number) => {
    const end = addMinutes(start, minutes);
    const made = meetingsCol.create({
      title: 'Focus time',
      agenda: 'Held so the day cannot be filled in around it.',
      kind: 'focus',
      date: onDate,
      start,
      end,
      organizer: me,
      invitees: [],
      status: 'confirmed',
      online: true,
    });

    toast.success(`${duration(minutes)} held`, {
      description: `${start}–${end} on ${relativeDay(onDate).toLowerCase()} is yours.`,
      action: { label: 'Undo', onClick: () => meetingsCol.remove(made.id) },
    });
  };

  const fromSlot = (slot: Slot, guests: string[], length: number) => {
    setFinding(false);
    setDate(slot.date);
    setSeed({ date: slot.date, start: slot.start });
    toast.success(`${relativeDay(slot.date)} at ${slot.start} works`, {
      description: `${guests.length + 1} people free${slot.space ? ` · ${slot.space.name} held for you` : ''} · ${duration(length)}.`,
    });
  };

  const step = (by: number) => {
    const size = lens === 'week' ? 7 : lens === 'agenda' ? AGENDA_DAYS : 1;
    setDate((current) => shiftDay(current, by * size));
  };

  const heading =
    lens === 'day'
      ? `${relativeDay(date)} · ${monthLabel(date)}`
      : lens === 'week'
        ? rangeLabel(week[0], week[6])
        : `${AGENDA_DAYS} days from ${relativeDay(date).toLowerCase()}`;

  const dayRows = shown.filter((meeting) => meeting.date === date).sort(byStart);

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">My Calendar · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">Where the day actually goes</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              A calendar that knows which rooms are taken, who is really free, and whether your
              work fits in what is left.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFinding(true)} className="dx-btn-secondary">
              <Sparkles size={15} aria-hidden="true" />
              Find a time
            </button>
            <button
              type="button"
              onClick={() => setSeed({ date, start: date === todayKey() ? nextSlot() : '09:00' })}
              className="dx-btn-primary"
            >
              <Plus size={15} aria-hidden="true" />
              New meeting
            </button>
          </div>
        </div>

        <section aria-label="Your day at a glance" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="dx-card px-5 py-4">
              <CountUp
                value={stat.value}
                className={cn(
                  'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                  stat.tone === 'brand' && 'text-brand-600',
                  stat.tone === 'warning' && stat.value > 0 && 'text-warning',
                  stat.tone === 'warning' && stat.value === 0 && 'text-ink',
                  stat.tone === 'neutral' && 'text-ink',
                )}
              />
              <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
          <section aria-labelledby="calendar-heading" className="dx-card overflow-hidden">
            <h3 id="calendar-heading" className="sr-only">
              Your calendar
            </h3>

            <Toolbar
              lenses={LENSES}
              lens={lens}
              onLens={setLens}
              heading={heading}
              onStep={step}
              onToday={() => setDate(todayKey())}
              date={date}
              filters={filters}
              onFilters={setFilters}
              people={people}
            />

            {lens === 'day' &&
              (dayRows.length === 0 && myGaps.length <= 1 ? (
                <EmptyState
                  icon={SearchX}
                  title="Nothing matches that on this day."
                  actionLabel="Clear the filters"
                  onAction={() => setFilters(NO_FILTERS)}
                />
              ) : (
                <div className="overflow-y-auto px-3 py-3">
                  <DayGrid
                    date={date}
                    meetings={dayRows}
                    spaces={spaces}
                    me={me}
                    dragged={dragged}
                    gaps={myGaps}
                    onOpen={(meeting) => setOpenId(meeting.id)}
                    onDragStart={setDragged}
                    onDragEnd={() => setDragged(null)}
                    onDrop={reschedule}
                    onCreateAt={(on, start) => setSeed({ date: on, start })}
                  />
                </div>
              ))}

            {lens === 'week' && (
              <WeekGrid
                days={week}
                meetings={shown}
                spaces={spaces}
                me={me}
                dragged={dragged}
                onOpen={(meeting) => setOpenId(meeting.id)}
                onDragStart={setDragged}
                onDragEnd={() => setDragged(null)}
                onDrop={reschedule}
                onCreateAt={(on, start) => setSeed({ date: on, start })}
                onPickDay={(picked) => {
                  setDate(picked);
                  setLens('day');
                }}
              />
            )}

            {lens === 'agenda' &&
              (shown.filter((meeting) => agendaDays.includes(meeting.date)).length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="Nothing in the next fortnight matches that."
                  actionLabel="Clear the filters"
                  onAction={() => setFilters(NO_FILTERS)}
                />
              ) : (
                <AgendaList
                  days={agendaDays}
                  meetings={shown}
                  spaces={spaces}
                  me={me}
                  onOpen={(meeting) => setOpenId(meeting.id)}
                />
              ))}
          </section>

          <DayRail
            date={date}
            meetings={all}
            tasks={tasks}
            me={me}
            onProtect={protect}
            onOpen={(meeting) => setOpenId(meeting.id)}
            onFindTime={() => setFinding(true)}
          />
        </div>
      </div>

      {open && (
        <MeetingSheet
          meeting={open}
          all={all}
          bookings={bookings}
          spaces={spaces}
          tasks={tasks}
          me={me}
          onClose={() => setOpenId(null)}
          onAnswer={answer}
          onRoom={changeRoom}
          onMove={(meeting, on, start) => {
            reschedule(meeting, on, start);
            setDate(on);
          }}
          onCancel={cancel}
        />
      )}

      {seed && (
        <NewMeetingDialog
          seed={seed}
          all={all}
          bookings={bookings}
          spaces={spaces}
          tasks={tasks}
          people={people}
          me={me}
          onClose={() => setSeed(null)}
          onCreate={create}
        />
      )}

      {finding && (
        <FindTimeDialog
          all={all}
          bookings={bookings}
          spaces={spaces}
          people={people}
          me={me}
          onClose={() => setFinding(false)}
          onPick={fromSlot}
        />
      )}
    </div>
  );
}
