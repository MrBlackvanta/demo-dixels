import { Headphones, Monitor, MessageSquare, Presentation, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Booking, BookingStatus, Space, SpaceKind } from '../../../lib/data';

export const DAY_START = 8;
export const DAY_END = 20;

const SLOT = 30;

const DAY_MINUTES = (DAY_END - DAY_START) * 60;
const OPENS = DAY_START * 60;
const CLOSES = DAY_END * 60;

export const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

export const SPACE_KINDS: SpaceKind[] = ['Meeting room', 'Huddle', 'Focus pod', 'Desk', 'Training'];

export const AMENITIES = [
  'Video',
  'Whiteboard',
  'Display',
  'Catering',
  'Daylight',
  'Soundproof',
  'Dual monitors',
  'Standing desk',
];

export const DURATIONS = [30, 60, 90, 120];

export const KIND_ICON: Record<SpaceKind, LucideIcon> = {
  'Meeting room': Users,
  Huddle: MessageSquare,
  'Focus pod': Headphones,
  Desk: Monitor,
  Training: Presentation,
};

interface Tone {
  label: string;
  chip: string;
  block: string;
}

export const STATUS: Record<BookingStatus, Tone> = {
  confirmed: {
    label: 'Confirmed',
    chip: 'bg-brand-50 text-brand-700',
    block: 'border-brand-300 bg-brand-100 text-brand-800',
  },
  'checked-in': {
    label: 'In the room',
    chip: 'bg-grn-100 text-grn-700',
    block: 'border-grn-400 bg-grn-100 text-grn-700',
  },
  pending: {
    label: 'Awaiting approval',
    chip: 'bg-warning-bg text-warning',
    block: 'border-dashed border-warning/45 bg-warning-bg text-warning',
  },
  cancelled: {
    label: 'Released',
    chip: 'bg-nt-100 text-ink-subtle',
    block: 'border-line bg-nt-100 text-ink-subtle',
  },
  declined: {
    label: 'Declined',
    chip: 'bg-danger-bg text-danger',
    block: 'border-line bg-nt-100 text-ink-subtle',
  },
};

const HOLDING: BookingStatus[] = ['confirmed', 'pending', 'checked-in'];

export const holdsSpace = (booking: Booking): boolean => HOLDING.includes(booking.status);

export const toMinutes = (clock: string): number => {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
};

export const toClock = (minutes: number): string => {
  const capped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  return `${String(Math.floor(capped / 60)).padStart(2, '0')}:${String(capped % 60).padStart(2, '0')}`;
};

const snapUp = (minutes: number): number => Math.ceil(minutes / SLOT) * SLOT;

export const addMinutes = (clock: string, minutes: number): string => toClock(toMinutes(clock) + minutes);

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  toMinutes(aStart) < toMinutes(bEnd) && toMinutes(aEnd) > toMinutes(bStart);

export const minutesLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

export const lengthLabel = (start: string, end: string): string =>
  minutesLabel(Math.max(0, toMinutes(end) - toMinutes(start)));

export const span = (start: string, end: string): { left: number; width: number } => {
  const from = Math.max(toMinutes(start), OPENS);
  const to = Math.min(toMinutes(end), CLOSES);
  return {
    left: ((from - OPENS) / DAY_MINUTES) * 100,
    width: (Math.max(to - from, 15) / DAY_MINUTES) * 100,
  };
};

export const nowPercent = (): number | null => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < OPENS || minutes > CLOSES) return null;
  return ((minutes - OPENS) / DAY_MINUTES) * 100;
};

export const clockNow = (): string => {
  const now = new Date();
  return toClock(Math.min(Math.max(snapUp(now.getHours() * 60 + now.getMinutes()), OPENS), CLOSES - SLOT));
};

export const fractionToClock = (fraction: number): string => {
  const raw = OPENS + fraction * DAY_MINUTES;
  const snapped = Math.round(raw / SLOT) * SLOT;
  return toClock(Math.min(Math.max(snapped, OPENS), CLOSES - SLOT));
};

export const bookingsFor = (all: Booking[], spaceId: string, date: string): Booking[] =>
  all
    .filter((booking) => booking.spaceId === spaceId && booking.date === date && holdsSpace(booking))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

export const conflictFor = (
  all: Booking[],
  spaceId: string,
  date: string,
  start: string,
  end: string,
  ignoreId?: string,
): Booking | undefined =>
  all.find(
    (booking) =>
      booking.id !== ignoreId &&
      booking.spaceId === spaceId &&
      booking.date === date &&
      holdsSpace(booking) &&
      overlaps(start, end, booking.start, booking.end),
  );

interface Availability {
  free: boolean;
  until?: string;
  holder?: Booking;
}

export const availabilityAt = (booked: Booking[], clock: string): Availability => {
  const minute = toMinutes(clock);
  const holder = booked.find(
    (booking) => toMinutes(booking.start) <= minute && toMinutes(booking.end) > minute,
  );
  if (holder) return { free: false, until: holder.end, holder };

  const next = booked.find((booking) => toMinutes(booking.start) > minute);
  return { free: true, until: next?.start };
};

export interface Criteria {
  headcount: number;
  duration: number;
  from: string;
  amenities: string[];
}

export interface Suggestion {
  space: Space;
  start: string;
  end: string;
}

export const suggest = (
  spaces: Space[],
  all: Booking[],
  date: string,
  { headcount, duration, from, amenities }: Criteria,
): Suggestion[] => {
  const earliest = snapUp(Math.max(toMinutes(from), OPENS));
  const latest = CLOSES - duration;

  return spaces
    .filter(
      (space) =>
        !space.offline &&
        space.capacity >= headcount &&
        amenities.every((amenity) => space.amenities.includes(amenity)),
    )
    .map((space): Suggestion | null => {
      for (let minute = earliest; minute <= latest; minute += SLOT) {
        const start = toClock(minute);
        const end = toClock(minute + duration);
        if (!conflictFor(all, space.id, date, start, end)) return { space, start, end };
      }
      return null;
    })
    .filter((found): found is Suggestion => found !== null)
    .sort(
      (a, b) =>
        toMinutes(a.start) - toMinutes(b.start) ||
        a.space.capacity - b.space.capacity ||
        a.space.name.localeCompare(b.space.name),
    );
};

export interface Filters {
  level: string;
  kind: string;
  capacity: number;
  amenities: string[];
  query: string;
}

export const NO_FILTERS: Filters = { level: 'all', kind: 'all', capacity: 1, amenities: [], query: '' };

export const activeFilterCount = (filters: Filters): number =>
  (filters.level === 'all' ? 0 : 1) +
  (filters.kind === 'all' ? 0 : 1) +
  (filters.capacity > 1 ? 1 : 0) +
  filters.amenities.length;

export const matchesFilters = (space: Space, filters: Filters): boolean => {
  if (filters.level !== 'all' && space.level !== filters.level) return false;
  if (filters.kind !== 'all' && space.kind !== filters.kind) return false;
  if (space.capacity < filters.capacity) return false;
  if (!filters.amenities.every((amenity) => space.amenities.includes(amenity))) return false;

  const needle = filters.query.trim().toLowerCase();
  if (!needle) return true;
  return [space.name, space.kind, space.level, ...space.amenities].some((field) =>
    field.toLowerCase().includes(needle),
  );
};

export const levelsOf = (spaces: Space[]): string[] =>
  [...new Set(spaces.map((space) => space.level))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

export const byLevelThenName = (a: Space, b: Space): number =>
  a.level.localeCompare(b.level, 'en', { numeric: true }) || a.name.localeCompare(b.name);

export const groupByLevel = (spaces: Space[]): Array<{ level: string; spaces: Space[] }> =>
  levelsOf(spaces).map((level) => ({
    level,
    spaces: spaces.filter((space) => space.level === level).sort((a, b) => a.name.localeCompare(b.name)),
  }));
