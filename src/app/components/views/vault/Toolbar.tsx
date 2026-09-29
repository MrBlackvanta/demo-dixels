import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { KINDS, STATUSES, activeFilterCount } from './assets';
import type { Filters } from './assets';
import type { Shelf } from '../../../lib/data';

export interface Lens {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface ToolbarProps {
  lenses: Lens[];
  lens: string;
  onLens: (lens: string) => void;
  filters: Filters;
  onFilters: (filters: Filters) => void;
  shelves: Shelf[];
  withFilters: boolean;
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  filters,
  onFilters,
  shelves,
  withFilters,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFilters({ ...filters, [key]: value });

  return (
    <div className="border-b border-line">
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <div className="min-w-0 max-w-full overflow-x-auto">
          <div
            role="tablist"
            aria-label="What to work on"
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
                {entry.count !== undefined && entry.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[0.6875rem]',
                      lens === entry.id ? 'bg-brand-50 text-brand-700' : 'bg-nt-100 text-ink-muted',
                    )}
                  >
                    {entry.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {withFilters && (
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                type="search"
                value={filters.text}
                onChange={(event) => set('text', event.target.value)}
                aria-label="Search every file in the vault"
                placeholder="Name, tag or credit"
                className="dx-field h-9 w-48 pl-8 text-[0.8125rem]"
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen((was) => !was)}
              aria-expanded={open}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-sm border px-3 text-[0.8125rem] transition-colors duration-[180ms]',
                active > 0
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-line text-ink-muted hover:text-ink',
              )}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              Filter
              {active > 0 && <span className="text-[0.6875rem]">({active})</span>}
            </button>
          </div>
        )}
      </div>

      {withFilters && (
        <div className="border-t border-line px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => set('shelf', 'all')}
              aria-pressed={filters.shelf === 'all'}
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[0.75rem] transition-colors duration-[180ms]',
                filters.shelf === 'all'
                  ? 'bg-nt-900 font-medium text-nt-0'
                  : 'bg-nt-50 text-ink-muted hover:text-ink',
              )}
            >
              Everything
            </button>
            {shelves.map((shelf) => (
              <button
                key={shelf.id}
                type="button"
                onClick={() => set('shelf', shelf.id)}
                aria-pressed={filters.shelf === shelf.id}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[0.75rem] transition-colors duration-[180ms]',
                  filters.shelf === shelf.id
                    ? 'bg-nt-900 font-medium text-nt-0'
                    : 'bg-nt-50 text-ink-muted hover:text-ink',
                )}
              >
                {shelf.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {withFilters && open && (
        <div className="flex flex-wrap items-end gap-3 border-t border-line bg-nt-50 px-4 py-3">
          <label className="text-[0.75rem] text-ink-muted">
            <span className="dx-eyebrow mb-1.5 block">Kind</span>
            <select
              value={filters.kind}
              onChange={(event) => set('kind', event.target.value as Filters['kind'])}
              className="dx-field h-9 text-[0.8125rem]"
            >
              <option value="all">Anything</option>
              {KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.plural}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[0.75rem] text-ink-muted">
            <span className="dx-eyebrow mb-1.5 block">Stage</span>
            <select
              value={filters.status}
              onChange={(event) => set('status', event.target.value as Filters['status'])}
              className="dx-field h-9 text-[0.8125rem]"
            >
              <option value="all">Any stage</option>
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
