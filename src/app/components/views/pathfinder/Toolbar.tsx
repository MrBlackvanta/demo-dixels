import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { FINDABLE, KIND_LABEL } from '../../../lib/wayfinding';
import { NO_FILTERS, activeFilterCount } from './wayfind';
import type { Filters } from './wayfind';

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
  showFilters: boolean;
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  heading,
  filters,
  onFilters,
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
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="place-search" className="dx-eyebrow mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id="place-search"
                type="search"
                value={filters.search}
                onChange={(event) => set('search', event.target.value)}
                placeholder="A room, a printer, a prayer room"
                className="dx-field pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="place-kind" className="dx-eyebrow mb-1.5 block">
              Showing
            </label>
            <select
              id="place-kind"
              value={filters.kind}
              onChange={(event) => set('kind', event.target.value)}
              className="dx-field"
            >
              <option value="all">Everything</option>
              {FINDABLE.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABEL[kind]}
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
