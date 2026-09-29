import {
  AirVent,
  Blocks,
  Fan,
  Flame,
  Moon,
  Power,
  Presentation,
  Snowflake,
  Sun,
  Sunset,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComfortVerdict, HvacMode, SignState, Space, Zone } from '../../../lib/data';

export const MODE_ICON: Record<HvacMode, LucideIcon> = {
  auto: Zap,
  cool: Snowflake,
  heat: Flame,
  fan: Fan,
  off: Power,
};

export const MODES: HvacMode[] = ['auto', 'cool', 'heat', 'fan', 'off'];

export const SIGNS: SignState[] = ['available', 'busy', 'focus', 'away'];

export const SIGN_TONE: Record<SignState, string> = {
  available: 'border-grn-300 bg-grn-50 text-grn-700',
  busy: 'border-danger/40 bg-danger-bg text-danger',
  focus: 'border-brand-300 bg-brand-50 text-brand-700',
  away: 'border-line-strong bg-nt-100 text-ink-muted',
};

export const SIGN_DOT: Record<SignState, string> = {
  available: 'bg-grn-500',
  busy: 'bg-danger',
  focus: 'bg-brand-600',
  away: 'bg-nt-400',
};

export const VERDICT_TONE: Record<ComfortVerdict, string> = {
  cold: 'border-brand-300 bg-brand-50 text-brand-700',
  cool: 'border-brand-200 bg-brand-50 text-brand-600',
  right: 'border-grn-300 bg-grn-50 text-grn-700',
  warm: 'border-warning/40 bg-warning-bg text-warning',
  hot: 'border-danger/40 bg-danger-bg text-danger',
};

const GLYPH_ICON: Record<string, LucideIcon> = {
  focus: Moon,
  meeting: Users,
  present: Presentation,
  wind: Sunset,
  sun: Sun,
  workshop: Blocks,
  air: AirVent,
};

export const GLYPHS = ['focus', 'meeting', 'present', 'wind', 'sun', 'workshop', 'air'];

export const glyphIcon = (glyph: string): LucideIcon => GLYPH_ICON[glyph] ?? Moon;

export const AIR_LABEL: Record<'fresh' | 'close' | 'stuffy', string> = {
  fresh: 'Fresh',
  close: 'Getting close',
  stuffy: 'Stuffy',
};

export const AIR_TONE: Record<'fresh' | 'close' | 'stuffy', string> = {
  fresh: 'text-grn-700',
  close: 'text-warning',
  stuffy: 'text-danger',
};

export const people = (count: number): string => (count === 1 ? '1 person' : `${count} people`);

export const degrees = (value: number): string => `${value.toFixed(1)}°`;

export interface Filters {
  search: string;
  level: string;
  state: string;
}

export const NO_FILTERS: Filters = { search: '', level: 'all', state: 'all' };

export const activeFilterCount = (filters: Filters): number =>
  (filters.level === 'all' ? 0 : 1) + (filters.state === 'all' ? 0 : 1);

export interface ZoneRow {
  zone: Zone;
  space: Space;
}

export const matchesFilters = (
  row: ZoneRow,
  filters: Filters,
  verdict: ComfortVerdict,
  held: boolean,
): boolean => {
  if (filters.level !== 'all' && row.space.level !== filters.level) return false;

  if (filters.state === 'uncomfortable' && verdict === 'right') return false;
  if (filters.state === 'comfortable' && verdict !== 'right') return false;
  if (filters.state === 'faulty' && row.zone.fault === undefined) return false;
  if (filters.state === 'free' && held) return false;
  if (filters.state === 'occupied' && row.zone.occupancy === 0) return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [row.space.name, row.space.level, row.space.kind, row.zone.fault ?? '']
    .some((field) => field.toLowerCase().includes(needle));
};
