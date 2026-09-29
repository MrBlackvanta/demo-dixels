import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { todayKey } from '../../../lib/format';
import type { MeetingKind } from '../../../lib/data';
import { KIND_LABEL, NO_FILTERS, activeFilterCount } from './dayplan';
import type { Filters } from './dayplan';

const KINDS: MeetingKind[] = [
  'meeting',
  'focus',
  'workshop',
  'one-to-one',
  'interview',
  'gathering',
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
  onStep: (by: number) => void;
  onToday: () => void;
  date: string;
  filters: Filters;
  onFilters: (filters: Filters) => void;
  people: string[];
}

export function Toolbar({
  lenses,
  lens,
  onLens,
  heading,
  onStep,
  onToday,
  date,
  filters,
  onFilters,
  people,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);
  const unit = lens === 'week' ? 'week' : lens === 'agenda' ? 'fortnight' : 'day';

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFilters({ ...filters, [key]: value });

  return (
    <div className="border-b border-line">
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label={`Previous ${unit}`}
            className="dx-btn-secondary w-9 px-0"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label={`Next ${unit}`}
            className="dx-btn-secondary w-9 px-0"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToday}
            disabled={date === todayKey()}
            className="dx-btn-secondary ml-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Today
          </button>
        </div>

        <p aria-live="polite" className="min-w-0 shrink-0 text-[0.875rem] font-medium text-ink">
          {heading}
        </p>

        <div className="ml-auto min-w-0 max-w-full overflow-x-auto">
          <div
            role="tablist"
            aria-label="How to look at the calendar"
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

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={cn('dx-btn-secondary shrink-0', active > 0 && 'border-brand-600 text-brand-700')}
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
        <div className="grid gap-4 border-t border-line bg-nt-50 px-4 py-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label htmlFor="cal-search" className="dx-eyebrow mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id="cal-search"
                type="search"
                value={filters.search}
                onChange={(event) => set('search', event.target.value)}
                placeholder="Title, agenda or a person"
                className="dx-field pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cal-person" className="dx-eyebrow mb-1.5 block">
              Whose calendar
            </label>
            <select
              id="cal-person"
              value={filters.person}
              onChange={(event) => set('person', event.target.value)}
              className="dx-field"
            >
              <option value="all">Everyone</option>
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cal-kind" className="dx-eyebrow mb-1.5 block">
              Kind
            </label>
            <select
              id="cal-kind"
              value={filters.kind}
              onChange={(event) => set('kind', event.target.value)}
              className="dx-field"
            >
              <option value="all">Anything</option>
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABEL[kind]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[0.8125rem] text-ink">
              <input
                type="checkbox"
                checked={filters.mineOnly}
                onChange={(event) => set('mineOnly', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Only mine
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
