import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { NO_FILTERS, activeFilterCount } from './comfort';
import type { Filters } from './comfort';

const STATES = [
  { id: 'all', label: 'Everything' },
  { id: 'uncomfortable', label: 'Outside the band' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'faulty', label: 'Reporting a fault' },
  { id: 'free', label: 'Nobody booked in' },
  { id: 'occupied', label: 'Somebody in it' },
];

export interface Lens {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ToolbarProps {
  lenses: Lens[];
  lens: string;
  onLens: (lens: string) => void;
  heading: string;
  filters: Filters;
  onFilters: (filters: Filters) => void;
  levels: string[];
  showFilters: boolean;
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  heading,
  filters,
  onFilters,
  levels,
  showFilters,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFilters({ ...filters, [key]: value });

  return (
    <div className="border-b border-line">
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <p aria-live="polite" className="min-w-0 shrink-0 text-[0.875rem] font-medium text-ink">
          {heading}
        </p>

        <div className="ml-auto min-w-0 max-w-full overflow-x-auto">
          <div
            role="tablist"
            aria-label="How to look at the building"
            className="flex w-max gap-1 rounded-lg bg-nt-50 p-1"
          >
            {lenses.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={lens === entry.id}
                onClick={() => onLens(entry.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                  lens === entry.id
                    ? 'bg-nt-0 font-medium text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <entry.icon size={14} aria-hidden="true" />
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className={cn(
              'dx-btn-secondary shrink-0',
              active > 0 && 'border-brand-600 text-brand-700',
            )}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filters
            {active > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-[0.625rem] font-medium text-nt-0">
                {active}
              </span>
            )}
          </button>
        )}
      </div>

      {showFilters && open && (
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label htmlFor="zone-search" className="dx-eyebrow mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id="zone-search"
                type="search"
                value={filters.search}
                onChange={(event) => set('search', event.target.value)}
                placeholder="A room name, a floor or a fault"
                className="dx-field pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="zone-level" className="dx-eyebrow mb-1.5 block">
              Floor
            </label>
            <select
              id="zone-level"
              value={filters.level}
              onChange={(event) => set('level', event.target.value)}
              className="dx-field"
            >
              <option value="all">Every floor</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="zone-state" className="dx-eyebrow mb-1.5 block">
              Showing
            </label>
            <select
              id="zone-state"
              value={filters.state}
              onChange={(event) => set('state', event.target.value)}
              className="dx-field"
            >
              {STATES.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {active > 0 && (
              <button
                type="button"
                onClick={() => onFilters({ ...NO_FILTERS, search: filters.search })}
                className="dx-btn-ghost"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
