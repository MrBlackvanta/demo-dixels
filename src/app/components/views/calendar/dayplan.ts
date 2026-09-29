import { Check, CircleHelp, Clock, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Meeting, MeetingKind, Rsvp } from '../../../lib/data';

export const KIND_LABEL: Record<MeetingKind, string> = {
  meeting: 'Meeting',
  focus: 'Focus time',
  workshop: 'Workshop',
  'one-to-one': 'One to one',
  interview: 'Interview',
  gathering: 'Event',
};

export const KIND_TONE: Record<MeetingKind, string> = {
  meeting: 'border-brand-300 bg-brand-100 text-brand-800',
  focus: 'border-grn-400 bg-grn-100 text-grn-700',
  workshop: 'border-brand-400 bg-brand-200 text-brand-900',
  'one-to-one': 'border-line-strong bg-nt-100 text-ink',
  interview: 'border-warning/45 bg-warning-bg text-warning',
  gathering: 'border-brand-200 bg-nt-0 text-brand-700',
};

export const KIND_EDGE: Record<MeetingKind, string> = {
  meeting: 'bg-brand-500',
  focus: 'bg-grn-500',
  workshop: 'bg-brand-700',
  'one-to-one': 'bg-nt-500',
  interview: 'bg-warning',
  gathering: 'bg-brand-300',
};

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: 'Going',
  no: 'Not going',
  maybe: 'Maybe',
  pending: 'No answer',
};

export const RSVP_ICON: Record<Rsvp, LucideIcon> = {
  yes: Check,
  no: X,
  maybe: CircleHelp,
  pending: Clock,
};

export const RSVP_TONE: Record<Rsvp, string> = {
  yes: 'bg-grn-100 text-grn-700',
  no: 'bg-nt-100 text-ink-subtle',
  maybe: 'bg-warning-bg text-warning',
  pending: 'bg-nt-100 text-ink-muted',
};

export const seats = (capacity: number): string =>
  capacity === 1 ? '1 seat' : `${capacity} seats`;

export interface Filters {
  search: string;
  person: string;
  kind: string;
  mineOnly: boolean;
}

export const NO_FILTERS: Filters = { search: '', person: 'all', kind: 'all', mineOnly: false };

export const activeFilterCount = (filters: Filters): number =>
  (filters.person === 'all' ? 0 : 1) + (filters.kind === 'all' ? 0 : 1) + (filters.mineOnly ? 1 : 0);

export const matchesFilters = (meeting: Meeting, filters: Filters, me: string): boolean => {
  if (filters.kind !== 'all' && meeting.kind !== filters.kind) return false;
  if (
    filters.person !== 'all' &&
    meeting.organizer !== filters.person &&
    !meeting.invitees.some((guest) => guest.name === filters.person)
  )
    return false;
  if (
    filters.mineOnly &&
    meeting.organizer !== me &&
    !meeting.invitees.some((guest) => guest.name === me)
  )
    return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [meeting.title, meeting.agenda, meeting.organizer, meeting.place ?? '']
    .concat(meeting.invitees.map((guest) => guest.name))
    .some((field) => field.toLowerCase().includes(needle));
};
