import {
  Accessibility,
  ArrowUpDown,
  Building2,
  Coffee,
  Cross,
  DoorOpen,
  Footprints,
  HeartPulse,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Package,
  Printer,
  Sofa,
  Sprout,
  Car,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Place, PlaceKind } from '../../../lib/data';
import { KIND_LABEL } from '../../../lib/wayfinding';

export const KIND_ICON: Record<PlaceKind, LucideIcon> = {
  room: Users,
  desk: Monitor,
  lift: ArrowUpDown,
  stairs: Footprints,
  entrance: DoorOpen,
  reception: Building2,
  cafe: Coffee,
  pantry: Coffee,
  printer: Printer,
  prayer: Moon,
  wellness: HeartPulse,
  washroom: Accessibility,
  firstaid: Cross,
  exit: LogOut,
  locker: Lock,
  parking: Car,
  post: Package,
  terrace: Sprout,
  itbar: Sofa,
};

export interface Filters {
  search: string;
  kind: string;
}

export const NO_FILTERS: Filters = { search: '', kind: 'all' };

export const activeFilterCount = (filters: Filters): number =>
  Number(filters.kind !== 'all') + Number(filters.search.trim() !== '');

export const matchesFilters = (place: Place, filters: Filters): boolean => {
  if (filters.kind !== 'all' && place.kind !== filters.kind) return false;

  const needle = filters.search.trim().toLowerCase();
  if (needle === '') return true;

  return [place.name, place.level, KIND_LABEL[place.kind], place.detail ?? '']
    .join(' ')
    .toLowerCase()
    .includes(needle);
};

export const searchPlaces = (places: Place[], term: string, limit = 8): Place[] => {
  const needle = term.trim().toLowerCase();
  if (needle === '') return [];

  return places
    .map((place) => {
      const name = place.name.toLowerCase();
      const score = name.startsWith(needle)
        ? 0
        : name.includes(needle)
          ? 1
          : KIND_LABEL[place.kind].toLowerCase().includes(needle)
            ? 2
            : (place.detail ?? '').toLowerCase().includes(needle)
              ? 3
              : -1;
      return { place, score };
    })
    .filter((hit) => hit.score >= 0)
    .sort((a, b) => a.score - b.score || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map((hit) => hit.place);
};
