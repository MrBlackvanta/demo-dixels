import { addMinutes, shiftDay, toClock, toMinutes, todayKey } from './format';
import { remainingOf } from './workload';
import type { Booking, Meeting, MeetingKind, Rsvp, Space, Task } from './data';

export const DAY_START = 8;
export const DAY_END = 20;
export const SLOT = 15;

export const OPENS = DAY_START * 60;
export const CLOSES = DAY_END * 60;
export const DAY_MINUTES = CLOSES - OPENS;

export const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

export const LENGTHS = [15, 30, 45, 60, 90, 120];

const HOLDING_ROOM = new Set(['confirmed', 'pending', 'checked-in']);

export const overlaps = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean => toMinutes(aStart) < toMinutes(bEnd) && toMinutes(aEnd) > toMinutes(bStart);

export const lengthOf = (meeting: Meeting): number =>
  Math.max(0, toMinutes(meeting.end) - toMinutes(meeting.start));

export const isLive = (meeting: Meeting): boolean => meeting.status !== 'cancelled';

export const answerOf = (meeting: Meeting, person: string): Rsvp => {
  if (meeting.organizer === person) return 'yes';
  return meeting.invitees.find((guest) => guest.name === person)?.answer ?? 'pending';
};

export const isOnInvite = (meeting: Meeting, person: string): boolean =>
  meeting.organizer === person || meeting.invitees.some((guest) => guest.name === person);

export const isOptionalFor = (meeting: Meeting, person: string): boolean =>
  meeting.invitees.find((guest) => guest.name === person)?.optional ?? false;

export const holdsTime = (meeting: Meeting, person: string): boolean =>
  isLive(meeting) && isOnInvite(meeting, person) && answerOf(meeting, person) !== 'no';

export const byStart = (a: Meeting, b: Meeting): number =>
  toMinutes(a.start) - toMinutes(b.start) || toMinutes(a.end) - toMinutes(b.end);

export const dayFor = (all: Meeting[], person: string, date: string): Meeting[] =>
  all.filter((meeting) => meeting.date === date && isOnInvite(meeting, person)).sort(byStart);

export const bookedFor = (all: Meeting[], person: string, date: string): Meeting[] =>
  all.filter((meeting) => meeting.date === date && holdsTime(meeting, person)).sort(byStart);

interface Block {
  from: number;
  to: number;
}

const merge = (meetings: Meeting[]): Block[] =>
  meetings
    .map((meeting) => ({ from: toMinutes(meeting.start), to: toMinutes(meeting.end) }))
    .sort((a, b) => a.from - b.from)
    .reduce<Block[]>((blocks, block) => {
      const last = blocks[blocks.length - 1];
      if (last && block.from <= last.to) {
        last.to = Math.max(last.to, block.to);
        return blocks;
      }
      return [...blocks, { ...block }];
    }, []);

export const busyMinutes = (all: Meeting[], person: string, date: string): number =>
  merge(bookedFor(all, person, date)).reduce((total, block) => total + (block.to - block.from), 0);

export interface Gap {
  start: string;
  end: string;
  minutes: number;
}

export const gapsFor = (all: Meeting[], person: string, date: string): Gap[] => {
  const blocks = merge(bookedFor(all, person, date));
  const gaps: Gap[] = [];
  let cursor = OPENS;

  for (const block of blocks) {
    if (block.from > cursor) gaps.push({ start: toClock(cursor), end: toClock(block.from), minutes: block.from - cursor });
    cursor = Math.max(cursor, block.to);
  }
  if (cursor < CLOSES) gaps.push({ start: toClock(cursor), end: toClock(CLOSES), minutes: CLOSES - cursor });

  return gaps.filter((gap) => gap.minutes >= SLOT);
};

export const WORK_FROM = 9 * 60;
export const WORK_TO = 18 * 60;
export const WORK_SPAN = WORK_TO - WORK_FROM;

const insideWorkday = (gap: Gap): number =>
  Math.max(
    0,
    Math.min(toMinutes(gap.end), WORK_TO) - Math.max(toMinutes(gap.start), WORK_FROM),
  );

export const freeInWorkday = (all: Meeting[], person: string, date: string): number =>
  gapsFor(all, person, date).reduce((total, gap) => total + insideWorkday(gap), 0);

export const bookedInWorkday = (all: Meeting[], person: string, date: string): number =>
  WORK_SPAN - freeInWorkday(all, person, date);

export const longestWorkGap = (all: Meeting[], person: string, date: string): Gap | undefined =>
  gapsFor(all, person, date)
    .map((gap) => {
      const from = Math.max(toMinutes(gap.start), WORK_FROM);
      const to = Math.min(toMinutes(gap.end), WORK_TO);
      return { start: toClock(from), end: toClock(to), minutes: to - from };
    })
    .filter((gap) => gap.minutes >= SLOT)
    .reduce<Gap | undefined>(
      (best, gap) => (best === undefined || gap.minutes > best.minutes ? gap : best),
      undefined,
    );

export const taskMinutesFor = (tasks: Task[], person: string, date: string): number =>
  tasks
    .filter(
      (task) =>
        task.owner === person &&
        task.state !== 'done' &&
        (task.state === 'doing' || task.due <= date),
    )
    .reduce((total, task) => total + remainingOf(task), 0);

export const roomHolder = (
  bookings: Booking[],
  spaceId: string,
  date: string,
  start: string,
  end: string,
  ignoreBookingId?: string,
): Booking | undefined =>
  bookings.find(
    (booking) =>
      booking.id !== ignoreBookingId &&
      booking.spaceId === spaceId &&
      booking.date === date &&
      HOLDING_ROOM.has(booking.status) &&
      overlaps(start, end, booking.start, booking.end),
  );

export const roomIsFree = (
  bookings: Booking[],
  spaceId: string,
  date: string,
  start: string,
  end: string,
  ignoreBookingId?: string,
): boolean => roomHolder(bookings, spaceId, date, start, end, ignoreBookingId) === undefined;

export interface Clash {
  person: string;
  meeting: Meeting;
}

export const clashesFor = (
  all: Meeting[],
  people: string[],
  date: string,
  start: string,
  end: string,
  ignoreId?: string,
): Clash[] =>
  people.flatMap((person) => {
    const hit = all.find(
      (meeting) =>
        meeting.id !== ignoreId &&
        meeting.date === date &&
        holdsTime(meeting, person) &&
        overlaps(start, end, meeting.start, meeting.end),
    );
    return hit ? [{ person, meeting: hit }] : [];
  });

export const isFreeAt = (
  all: Meeting[],
  person: string,
  date: string,
  start: string,
  end: string,
  ignoreId?: string,
): boolean => clashesFor(all, [person], date, start, end, ignoreId).length === 0;

export interface Slot {
  date: string;
  start: string;
  end: string;
  space?: Space;
}

export interface Search {
  people: string[];
  length: number;
  days: number;
  headcount: number;
  needsRoom: boolean;
}

const roomFor = (
  spaces: Space[],
  bookings: Booking[],
  date: string,
  start: string,
  end: string,
  headcount: number,
): Space | undefined =>
  spaces
    .filter((space) => !space.offline && space.capacity >= headcount && space.kind !== 'Desk')
    .sort((a, b) => a.capacity - b.capacity || a.name.localeCompare(b.name))
    .find((space) => roomIsFree(bookings, space.id, date, start, end));

export const openSlots = (
  all: Meeting[],
  spaces: Space[],
  bookings: Booking[],
  from: string,
  { people, length, days, headcount, needsRoom }: Search,
  limit = 6,
): Slot[] => {
  const found: Slot[] = [];

  for (let offset = 0; offset < days && found.length < limit; offset += 1) {
    const date = shiftDay(from, offset);
    const earliest = date === todayKey() ? Math.max(OPENS, snapUp(nowMinutes())) : OPENS;

    for (let minute = earliest; minute + length <= CLOSES && found.length < limit; minute += SLOT) {
      const start = toClock(minute);
      const end = toClock(minute + length);

      if (clashesFor(all, people, date, start, end).length > 0) continue;

      const space = needsRoom ? roomFor(spaces, bookings, date, start, end, headcount) : undefined;
      if (needsRoom && space === undefined) continue;

      found.push({ date, start, end, space });
      minute += length - SLOT;
    }
  }

  return found;
};

export const tightestOf = (
  all: Meeting[],
  people: string[],
  from: string,
  length: number,
  days: number,
): string | undefined => {
  const blocked = new Map(people.map((person) => [person, 0]));

  for (let offset = 0; offset < days; offset += 1) {
    const date = shiftDay(from, offset);
    for (let minute = OPENS; minute + length <= CLOSES; minute += SLOT) {
      const start = toClock(minute);
      const end = toClock(minute + length);
      for (const { person } of clashesFor(all, people, date, start, end)) {
        blocked.set(person, (blocked.get(person) ?? 0) + 1);
      }
    }
  }

  return [...blocked.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export const nowMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const snapUp = (minutes: number): number => Math.ceil(minutes / SLOT) * SLOT;

export const nextSlot = (): string => toClock(Math.min(Math.max(snapUp(nowMinutes()), OPENS), CLOSES - 60));

export const nowOffset = (date: string): number | null => {
  if (date !== todayKey()) return null;
  const minutes = nowMinutes();
  if (minutes < OPENS || minutes > CLOSES) return null;
  return ((minutes - OPENS) / DAY_MINUTES) * 100;
};

export const placeOf = (meeting: Meeting): { top: number; height: number } => {
  const from = Math.max(toMinutes(meeting.start), OPENS);
  const to = Math.min(toMinutes(meeting.end), CLOSES);
  return {
    top: ((from - OPENS) / DAY_MINUTES) * 100,
    height: (Math.max(to - from, SLOT) / DAY_MINUTES) * 100,
  };
};

export interface Lane {
  lane: number;
  lanes: number;
}

export const layoutOf = (sameDay: Meeting[]): Map<string, Lane> => {
  const placed = new Map<string, Lane>();
  const ordered = [...sameDay].sort(byStart);

  let cluster: Meeting[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;

    const columns: number[] = [];
    const seats = new Map<string, number>();

    for (const meeting of cluster) {
      const from = toMinutes(meeting.start);
      let column = columns.findIndex((busyUntil) => busyUntil <= from);
      if (column === -1) column = columns.push(0) - 1;
      columns[column] = toMinutes(meeting.end);
      seats.set(meeting.id, column);
    }

    for (const meeting of cluster) {
      placed.set(meeting.id, { lane: seats.get(meeting.id) ?? 0, lanes: columns.length });
    }

    cluster = [];
    clusterEnd = -1;
  };

  for (const meeting of ordered) {
    if (cluster.length > 0 && toMinutes(meeting.start) >= clusterEnd) flush();
    cluster.push(meeting);
    clusterEnd = Math.max(clusterEnd, toMinutes(meeting.end));
  }
  flush();

  return placed;
};

export const weekStart = (date: string): string => {
  const at = new Date(`${date}T00:00:00`);
  return shiftDay(date, -((at.getDay() + 6) % 7));
};

export const weekOf = (date: string): string[] =>
  Array.from({ length: 7 }, (_, i) => shiftDay(weekStart(date), i));

export const monthLabel = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const rangeLabel = (from: string, to: string): string => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  return [
    start.toLocaleDateString('en-GB', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' }),
    end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  ].join(' – ');
};

export const weekdayLabel = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });

export const dayNumber = (date: string): number => new Date(`${date}T00:00:00`).getDate();

export const isWeekend = (date: string): boolean => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 5 || day === 6;
};

export const isPast = (date: string): boolean => date < todayKey();

export const KIND_NAME: Record<MeetingKind, string> = {
  meeting: 'Meeting',
  focus: 'Focus time',
  workshop: 'Workshop',
  'one-to-one': 'One to one',
  interview: 'Interview',
  gathering: 'Event',
};

export const RSVP_NAME: Record<Rsvp, string> = {
  yes: 'Going',
  no: 'Not going',
  maybe: 'Maybe',
  pending: 'No answer yet',
};

export const tally = (meeting: Meeting): Record<Rsvp, number> =>
  meeting.invitees.reduce(
    (counts, guest) => ({ ...counts, [guest.answer]: counts[guest.answer] + 1 }),
    { yes: 1, no: 0, maybe: 0, pending: 0 } as Record<Rsvp, number>,
  );

export const answerWith = (meeting: Meeting, person: string, answer: Rsvp): Partial<Meeting> => ({
  invitees: meeting.invitees.map((guest) =>
    guest.name === person ? { ...guest, answer } : guest,
  ),
});

export const movedTo = (date: string, start: string, length: number): Partial<Meeting> => ({
  date,
  start,
  end: addMinutes(start, length),
});

export const cancelled: Partial<Meeting> = { status: 'cancelled' };

export const inRoom = (spaceId: string, bookingId?: string): Partial<Meeting> => ({
  spaceId,
  bookingId,
  online: false,
});

export const relativeDay = (date: string): string => {
  const diff = Math.round(
    (new Date(`${date}T00:00:00`).getTime() - new Date(`${todayKey()}T00:00:00`).getTime()) /
      86_400_000,
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
};
