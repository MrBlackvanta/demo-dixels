import { showing } from '../../../lib/publishing';
import type {
  Canvas,
  Channel,
  Entry,
  EntryKind,
  EntryLocale,
  EntryStatus,
  EntrySurface,
  Revision,
  Screen,
  Translation,
} from '../../../lib/data';

export const LOCALES: Array<{ id: EntryLocale; name: string; endonym: string; rtl: boolean }> = [
  { id: 'ar', name: 'Arabic', endonym: 'العربية', rtl: true },
  { id: 'fr', name: 'French', endonym: 'Français', rtl: false },
];

export const KINDS: Array<{ id: EntryKind; label: string; blurb: string }> = [
  { id: 'notice', label: 'Notice', blurb: 'Something happening, with a shelf life.' },
  { id: 'policy', label: 'Policy', blurb: 'A rule people look up rather than read once.' },
  { id: 'howto', label: 'How-to', blurb: 'The answer to a question support keeps getting.' },
  { id: 'welcome', label: 'Welcome', blurb: 'What a guest reads before anyone reaches them.' },
];

export const STATUSES: Array<{ id: EntryStatus; label: string; tone: string }> = [
  { id: 'draft', label: 'Draft', tone: 'bg-nt-100 text-ink-muted' },
  { id: 'review', label: 'In review', tone: 'bg-warning/12 text-warning' },
  { id: 'scheduled', label: 'Scheduled', tone: 'bg-brand-50 text-brand-700' },
  { id: 'live', label: 'Live', tone: 'bg-success/12 text-success' },
  { id: 'retired', label: 'Retired', tone: 'bg-nt-100 text-ink-subtle' },
];

export const SURFACES: Array<{
  id: EntrySurface;
  name: string;
  product: string;
  blurb: string;
  path: string;
}> = [
  {
    id: 'today',
    name: 'The home page',
    product: 'Today',
    blurb: 'Under the greeting, before anything else competes for attention.',
    path: '/today',
  },
  {
    id: 'livecanvas',
    name: 'Screens around the building',
    product: 'LiveCanvas',
    blurb: 'Painted onto whichever notice boards are pointed at the entry.',
    path: '/livecanvas',
  },
  {
    id: 'resolve',
    name: 'The help desk',
    product: 'Resolve',
    blurb: 'Offered while someone is typing a ticket, and in the help drawer.',
    path: '/resolve',
  },
];

export const kindLabel = (kind: EntryKind): string =>
  KINDS.find((row) => row.id === kind)?.label ?? kind;

export const statusOf = (status: EntryStatus) =>
  STATUSES.find((row) => row.id === status) ?? STATUSES[0];

export const surfaceOf = (surface: EntrySurface) =>
  SURFACES.find((row) => row.id === surface) ?? SURFACES[0];

export const localeOf = (locale: EntryLocale) =>
  LOCALES.find((row) => row.id === locale) ?? LOCALES[0];

export { showing };

export const translationOf = (entry: Entry, locale: EntryLocale): Translation | undefined =>
  entry.translations.find((row) => row.locale === locale);

export type LocaleState = 'ready' | 'stale' | 'missing';

export const localeState = (entry: Entry, locale: EntryLocale): LocaleState => {
  const translation = translationOf(entry, locale);
  if (translation === undefined) return 'missing';
  return translation.fromVersion < entry.version ? 'stale' : 'ready';
};

export const staleCount = (entry: Entry): number =>
  LOCALES.filter((locale) => localeState(entry, locale.id) === 'stale').length;

export const readyCount = (entry: Entry): number =>
  LOCALES.filter((locale) => localeState(entry, locale.id) === 'ready').length;

export interface Reach {
  screens: number;
  boards: string[];
  onToday: boolean;
  inHelp: boolean;
}

export interface Wall {
  canvases: Canvas[];
  channels: Channel[];
  screens: Screen[];
}

export function reachOf(entry: Entry, wall: Wall): Reach {
  const boards = wall.canvases.filter((canvas) => canvas.entryId === entry.id);
  const boardIds = new Set(boards.map((canvas) => canvas.id));
  const carrying = wall.channels.filter((channel) =>
    channel.canvasIds.some((id) => boardIds.has(id)),
  );
  const carryingIds = new Set(carrying.map((channel) => channel.id));

  return {
    screens: showing(entry)
      ? wall.screens.filter(
          (screen) => screen.status !== 'dark' && carryingIds.has(screen.channelId),
        ).length
      : 0,
    boards: boards.map((canvas) => canvas.title),
    onToday: entry.surfaces.includes('today') && showing(entry),
    inHelp: entry.surfaces.includes('resolve') && entry.status === 'live',
  };
}

export const reachLabel = (reach: Reach): string => {
  const parts: string[] = [];
  if (reach.screens > 0) {
    parts.push(`${reach.screens} ${reach.screens === 1 ? 'screen' : 'screens'}`);
  }
  if (reach.onToday) parts.push('the home page');
  if (reach.inHelp) parts.push('the help desk');
  if (parts.length === 0) return 'Nowhere yet';
  if (parts.length === 1) return `On ${parts[0]}`;
  return `On ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

export interface Edit {
  title: string;
  summary: string;
  body: string;
  note: string;
}

export function revised(entry: Entry, edit: Edit, by: string): Partial<Entry> {
  const previous: Revision = {
    version: entry.version,
    savedAt: entry.updatedAt,
    savedBy: entry.owner,
    note: entry.reviewNote ?? 'Saved',
    title: entry.title,
    body: entry.body,
  };

  return {
    title: edit.title,
    summary: edit.summary,
    body: edit.body,
    version: entry.version + 1,
    history: [...entry.history, previous],
    reviewNote: edit.note,
  };
}

export const unchanged = (entry: Entry, edit: Edit): boolean =>
  entry.title === edit.title && entry.summary === edit.summary && entry.body === edit.body;

export interface Filters {
  text: string;
  kind: EntryKind | 'all';
  status: EntryStatus | 'all';
  surface: EntrySurface | 'all';
}

export const NO_FILTERS: Filters = { text: '', kind: 'all', status: 'all', surface: 'all' };

export const activeFilterCount = (filters: Filters): number =>
  [filters.kind, filters.status, filters.surface].filter((value) => value !== 'all').length;

export function match(entry: Entry, filters: Filters): boolean {
  if (filters.kind !== 'all' && entry.kind !== filters.kind) return false;
  if (filters.status !== 'all' && entry.status !== filters.status) return false;
  if (filters.surface !== 'all' && !entry.surfaces.includes(filters.surface)) return false;

  const needle = filters.text.trim().toLowerCase();
  if (needle === '') return true;

  return [entry.title, entry.summary, entry.body, ...entry.keywords]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

const RANK: Record<EntryStatus, number> = {
  review: 0,
  scheduled: 1,
  live: 2,
  draft: 3,
  retired: 4,
};

export const byUrgency = (a: Entry, b: Entry): number =>
  RANK[a.status] - RANK[b.status] || b.updatedAt.localeCompare(a.updatedAt);
