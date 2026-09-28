import { todayKey } from '../../../lib/format';
import type { Visit, VisitKind, VisitStatus } from '../../../lib/data';

export const VISIT_KINDS: VisitKind[] = ['Guest', 'VIP', 'Interview', 'Vendor', 'Contractor'];

export const LOCATIONS = [
  'Orchid · Level 5',
  'Studio 3 · Level 2',
  'Level 4 lounge',
  'Boardroom · Level 6',
  'Reception · Ground',
];

export const CARRIERS = ['DHL', 'Aramex', 'FedEx', 'SMSA', 'Naqel'];

interface StatusTone {
  label: string;
  className: string;
  dot: string;
}

export const STATUS: Record<VisitStatus, StatusTone> = {
  invited: { label: 'Invited', className: 'bg-nt-100 text-ink-muted', dot: 'bg-nt-400' },
  'pre-registered': { label: 'Pre-registered', className: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  'checked-in': { label: 'On site', className: 'bg-grn-100 text-grn-700', dot: 'bg-grn-500' },
  'checked-out': { label: 'Checked out', className: 'bg-nt-100 text-ink-subtle', dot: 'bg-nt-300' },
  cancelled: { label: 'Cancelled', className: 'bg-nt-100 text-ink-subtle', dot: 'bg-nt-300' },
};

export const ACTIVE_STATUSES: VisitStatus[] = ['invited', 'pre-registered', 'checked-in'];

export const isActive = (visit: Visit): boolean => ACTIVE_STATUSES.includes(visit.status);

export const isToday = (visit: Visit): boolean => visit.date === todayKey();

export const newCode = (): string => `VF-${Math.floor(1000 + Math.random() * 9000)}`;

export const minutesOnSite = (visit: Visit): number | null => {
  if (visit.status !== 'checked-in' || !visit.arrivedAt) return null;
  return Math.max(0, Math.round((Date.now() - new Date(visit.arrivedAt).getTime()) / 60_000));
};

export const durationLabel = (minutes: number): string => {
  if (minutes < 1) return 'Just in';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

export const byStartTime = (a: Visit, b: Visit): number =>
  a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date);

export const matches = (visit: Visit, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [visit.guest, visit.company, visit.code, visit.email, visit.host, visit.badge].some((field) =>
    field?.toLowerCase().includes(needle),
  );
};
