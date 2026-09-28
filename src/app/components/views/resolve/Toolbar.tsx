import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { TicketPriority, TicketTeam } from '../../../lib/data';
import { NO_FILTERS, PRIORITIES, TEAMS, activeFilterCount } from './support';
import type { Filters } from './support';

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
  searchLabel: string;
  withFilters?: boolean;
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  filters,
  onFilters,
  searchLabel,
  withFilters = false,
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
            aria-label="Which requests to show"
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
                      'rounded-full px-1.5 text-[0.625rem] font-medium',
                      lens === entry.id ? 'bg-brand-600 text-nt-0' : 'bg-nt-200 text-ink-muted',
                    )}
                  >
                    {entry.count}
                  </span>
                )}
              </button>
            ))}
          </div>
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
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="dx-field pl-8"
          />
        </div>

        {withFilters && (
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

      {open && withFilters && (
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="queue-team" className="dx-eyebrow mb-1.5 block">
              Team
            </label>
            <select
              id="queue-team"
              value={filters.team}
              onChange={(event) => set('team', event.target.value as TicketTeam | 'all')}
              className="dx-field"
            >
              <option value="all">Every team</option>
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="queue-priority" className="dx-eyebrow mb-1.5 block">
              Priority
            </label>
            <select
              id="queue-priority"
              value={filters.priority}
              onChange={(event) => set('priority', event.target.value as TicketPriority | 'all')}
              className="dx-field capitalize"
            >
              <option value="all">Any priority</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority} className="capitalize">
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 pb-2.5 text-[0.8125rem] text-ink">
              <input
                type="checkbox"
                checked={filters.breachedOnly}
                onChange={(event) => set('breachedOnly', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Past target only
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
