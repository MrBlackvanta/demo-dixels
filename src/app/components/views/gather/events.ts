import { Coffee, GraduationCap, HeartPulse, Megaphone, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dateKey, todayKey } from '../../../lib/format';
import type { EventCategory, EventMode, EventStatus, GatherEvent } from '../../../lib/data';

export const CATEGORIES: EventCategory[] = [
  'Learning',
  'Social',
  'Wellness',
  'Town hall',
  'Culture',
];

export const MODES: EventMode[] = ['In person', 'Hybrid', 'Virtual'];

export const CATEGORY_ICON: Record<EventCategory, LucideIcon> = {
  Learning: GraduationCap,
  Social: Coffee,
  Wellness: HeartPulse,
  'Town hall': Megaphone,
  Culture: Sparkles,
};

export const CATEGORY_TONE: Record<EventCategory, { chip: string; wash: string; bar: string }> = {
  Learning: { chip: 'bg-brand-50 text-brand-700', wash: 'from-brand-500/85 to-brand-700/85', bar: 'bg-brand-500' },
  Social: { chip: 'bg-warning-bg text-warning', wash: 'from-warning/80 to-brand-700/80', bar: 'bg-warning' },
  Wellness: { chip: 'bg-grn-100 text-grn-700', wash: 'from-grn-500/85 to-brand-700/80', bar: 'bg-grn-500' },
  'Town hall': { chip: 'bg-nt-200 text-ink', wash: 'from-nt-700/90 to-nt-900/90', bar: 'bg-nt-700' },
  Culture: { chip: 'bg-brand-100 text-brand-800', wash: 'from-brand-400/85 to-brand-800/85', bar: 'bg-brand-400' },
};

export const STATUS_TONE: Record<EventStatus, { label: string; chip: string }> = {
  draft: { label: 'Draft', chip: 'bg-nt-100 text-ink-subtle' },
  published: { label: 'Published', chip: 'bg-grn-100 text-grn-700' },
  cancelled: { label: 'Cancelled', chip: 'bg-danger-bg text-danger' },
};

export const toMinutes = (clock: string): number => {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
};

export const seatsLeft = (event: GatherEvent): number =>
  Math.max(event.capacity - event.going.length, 0);

export const isFull = (event: GatherEvent): boolean => seatsLeft(event) === 0;

export const isGoing = (event: GatherEvent, name: string): boolean => event.going.includes(name);

export const isWaiting = (event: GatherEvent, name: string): boolean =>
  event.waitlist.includes(name);

export const isPast = (event: GatherEvent): boolean => {
  const today = todayKey();
  if (event.date !== today) return event.date < today;
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() >= toMinutes(event.end);
};

export const isLive = (event: GatherEvent): boolean => {
  if (event.date !== todayKey()) return false;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= toMinutes(event.start) && minutes < toMinutes(event.end);
};

export const byWhen = (a: GatherEvent, b: GatherEvent): number =>
  a.date.localeCompare(b.date) || toMinutes(a.start) - toMinutes(b.start);

export const priceLabel = (price: number): string => (price === 0 ? 'Free' : `SAR ${price}`);

export const lengthLabel = (start: string, end: string): string => {
  const minutes = toMinutes(end) - toMinutes(start);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
  return `${hours}h ${rest}m`;
};

export interface Filters {
  search: string;
  category: EventCategory | 'all';
  mode: EventMode | 'all';
  freeOnly: boolean;
}

export const NO_FILTERS: Filters = { search: '', category: 'all', mode: 'all', freeOnly: false };

export const activeFilterCount = (filters: Filters): number =>
  (filters.category === 'all' ? 0 : 1) + (filters.mode === 'all' ? 0 : 1) + (filters.freeOnly ? 1 : 0);

export const matchesFilters = (event: GatherEvent, filters: Filters): boolean => {
  if (filters.category !== 'all' && event.category !== filters.category) return false;
  if (filters.mode !== 'all' && event.mode !== filters.mode) return false;
  if (filters.freeOnly && event.price > 0) return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [event.title, event.location, event.host, event.team, ...event.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle);
};

export const join = (event: GatherEvent, name: string): Partial<GatherEvent> =>
  isFull(event)
    ? { waitlist: [...event.waitlist, name] }
    : { going: [...event.going, name] };

export const leave = (event: GatherEvent, name: string): Partial<GatherEvent> => {
  const going = event.going.filter((person) => person !== name);
  const waitlist = event.waitlist.filter((person) => person !== name);
  const gaveUpASeat = event.going.includes(name);
  const [nextInLine, ...stillWaiting] = waitlist;

  if (gaveUpASeat && nextInLine) {
    return { going: [...going, nextInLine], waitlist: stillWaiting };
  }

  return { going, waitlist };
};

export const promote = (event: GatherEvent, name: string): Partial<GatherEvent> => ({
  going: [...event.going, name],
  waitlist: event.waitlist.filter((person) => person !== name),
});

export const monthOf = (key: string): string => key.slice(0, 7);

export const monthGrid = (month: string): string[] => {
  const first = new Date(`${month}-01T00:00:00`);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return dateKey(day);
  });
};

export const shiftMonth = (month: string, by: number): string => {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() + by);
  return monthOf(dateKey(date));
};

export const monthLabel = (month: string): string =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const dayNumber = (key: string): string => String(Number(key.slice(8, 10)));
