import { useState } from 'react';
import { Compass, Rss, Search, SlidersHorizontal, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { TribeCategory } from '../../../lib/data';
import { CATEGORIES, NO_FILTERS, activeFilterCount } from './community';
import type { Filters } from './community';

export type View = 'feed' | 'discover' | 'mine';

const VIEWS: Array<{ id: View; label: string; icon: typeof Rss }> = [
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'mine', label: 'My tribes', icon: Users },
];

interface ToolbarProps {
  view: View;
  onView: (view: View) => void;
  filters: Filters;
  onFilters: (filters: Filters) => void;
  mineCount: number;
}

export function Toolbar({ view, onView, filters, onFilters, mineCount }: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFilters({ ...filters, [key]: value });

  return (
    <div className="border-b border-line">
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <div role="tablist" aria-label="How to view tribes" className="flex gap-1 rounded-lg bg-nt-50 p-1">
          {VIEWS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={view === entry.id}
              onClick={() => onView(entry.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                view === entry.id
                  ? 'bg-nt-0 font-medium text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <entry.icon size={14} aria-hidden="true" />
              {entry.label}
              {entry.id === 'mine' && mineCount > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 text-[0.625rem] font-medium text-nt-0">
                  {mineCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[10rem] flex-1 sm:max-w-xs">
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => set('search', event.target.value)}
            placeholder="Search tribes, leads, topics"
            aria-label="Search tribes"
            className="dx-field pl-8"
          />
        </div>

        {view !== 'feed' && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className={cn('dx-btn-secondary', active > 0 && 'border-brand-600 text-brand-700')}
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

      {open && view !== 'feed' && (
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="tribes-category" className="dx-eyebrow mb-1.5 block">
              Kind
            </label>
            <select
              id="tribes-category"
              value={filters.category}
              onChange={(event) => set('category', event.target.value as TribeCategory | 'all')}
              className="dx-field"
            >
              <option value="all">Every kind</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 pb-2.5 text-[0.8125rem] text-ink">
              <input
                type="checkbox"
                checked={filters.openOnly}
                onChange={(event) => set('openOnly', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Join without asking
            </label>
            {active > 0 && (
              <button
                type="button"
                onClick={() => onFilters({ ...NO_FILTERS, search: filters.search })}
                className="dx-btn-ghost mb-1"
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
