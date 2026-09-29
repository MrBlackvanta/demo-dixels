import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { Project, TaskPriority } from '../../../lib/data';
import { NO_FILTERS, PRIORITY_LABEL, activeFilterCount } from './plan';
import type { Filters } from './plan';

const PRIORITIES: TaskPriority[] = ['critical', 'high', 'normal', 'low'];

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
  projects: Project[];
  people: string[];
  searchLabel: string;
  withFilters?: boolean;
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  filters,
  onFilters,
  projects,
  people,
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
            aria-label="How to look at the work"
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
                      'rounded-full px-1.5 text-[0.625rem] font-medium tabular-nums',
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
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-3">
          <div>
            <label htmlFor="board-project" className="dx-eyebrow mb-1.5 block">
              Project
            </label>
            <select
              id="board-project"
              value={filters.projectId}
              onChange={(event) => set('projectId', event.target.value)}
              className="dx-field"
            >
              <option value="all">Every project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.key} · {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="board-owner" className="dx-eyebrow mb-1.5 block">
              Owner
            </label>
            <select
              id="board-owner"
              value={filters.owner}
              onChange={(event) => set('owner', event.target.value)}
              className="dx-field"
            >
              <option value="all">Anyone</option>
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="board-priority" className="dx-eyebrow mb-1.5 block">
              Priority
            </label>
            <select
              id="board-priority"
              value={filters.priority}
              onChange={(event) => set('priority', event.target.value as TaskPriority | 'all')}
              className="dx-field"
            >
              <option value="all">Any priority</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABEL[priority]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
            <label className="flex items-center gap-2 text-[0.8125rem] text-ink">
              <input
                type="checkbox"
                checked={filters.blockedOnly}
                onChange={(event) => set('blockedOnly', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Only the ones that are stuck
            </label>
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
