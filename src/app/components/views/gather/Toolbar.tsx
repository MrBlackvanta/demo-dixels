import { useState } from 'react';
import { CalendarRange, LayoutGrid, Search, SlidersHorizontal, Ticket } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { EventCategory, EventMode } from '../../../lib/data';
import { CATEGORIES, MODES, NO_FILTERS, activeFilterCount } from './events';
import type { Filters } from './events';

export type View = 'browse' | 'mine' | 'calendar';

const VIEWS: Array<{ id: View; label: string; icon: typeof LayoutGrid }> = [
  { id: 'browse', label: 'Browse', icon: LayoutGrid },
  { id: 'mine', label: 'My events', icon: Ticket },
  { id: 'calendar', label: 'Calendar', icon: CalendarRange },
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
        <div role="tablist" aria-label="How to view events" className="flex gap-1 rounded-lg bg-nt-50 p-1">
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
            placeholder="Search events, hosts, places"
            aria-label="Search events"
            className="dx-field pl-8"
          />
        </div>

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
      </div>

      {open && (
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="gather-category" className="dx-eyebrow mb-1.5 block">
              Kind
            </label>
            <select
              id="gather-category"
              value={filters.category}
              onChange={(event) => set('category', event.target.value as EventCategory | 'all')}
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

          <div>
            <label htmlFor="gather-mode" className="dx-eyebrow mb-1.5 block">
              How to attend
            </label>
            <select
              id="gather-mode"
              value={filters.mode}
              onChange={(event) => set('mode', event.target.value as EventMode | 'all')}
              className="dx-field"
            >
              <option value="all">Any way</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 pb-2.5 text-[0.8125rem] text-ink">
              <input
                type="checkbox"
                checked={filters.freeOnly}
                onChange={(event) => set('freeOnly', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Free only
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
