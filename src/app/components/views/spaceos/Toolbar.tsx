import { useId, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../ui/utils';
import { shiftDay, todayKey } from '../../../lib/format';
import { AMENITIES, NO_FILTERS, SPACE_KINDS, activeFilterCount } from './spaces';
import type { Filters } from './spaces';

export type View = 'timeline' | 'rooms';

const VIEWS: Array<{ id: View; label: string }> = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'rooms', label: 'Rooms' },
];

interface ToolbarProps {
  date: string;
  onDate: (date: string) => void;
  view: View;
  onView: (view: View) => void;
  filters: Filters;
  onFilters: (filters: Filters) => void;
  levels: string[];
}

export function Toolbar({ date, onDate, view, onView, filters, onFilters, levels }: ToolbarProps) {
  const fieldId = useId();
  const [open, setOpen] = useState(false);

  const today = todayKey();
  const refined = activeFilterCount(filters);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onFilters({ ...filters, [key]: value });

  const toggleAmenity = (amenity: string) =>
    onFilters({
      ...filters,
      amenities: filters.amenities.includes(amenity)
        ? filters.amenities.filter((row) => row !== amenity)
        : [...filters.amenities, amenity],
    });

  return (
    <div className="border-b border-line">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div role="tablist" aria-label="How to view the day" className="flex gap-1.5">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => onView(item.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                view === item.id
                  ? 'bg-ink font-medium text-nt-0'
                  : 'text-ink-muted hover:bg-nt-100 hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {date !== today && (
            <button type="button" onClick={() => onDate(today)} className="dx-btn-ghost px-2.5 py-1.5">
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => onDate(shiftDay(date, -1))}
            disabled={date <= today}
            aria-label="Previous day"
            className="dx-btn-ghost px-2 disabled:opacity-35"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(event) => onDate(event.target.value || today)}
            aria-label="Day to show"
            className="dx-field w-auto py-1.5 text-[0.8125rem]"
          />
          <button
            type="button"
            onClick={() => onDate(shiftDay(date, 1))}
            aria-label="Next day"
            className="dx-btn-ghost px-2"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-56">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => set('query', event.target.value)}
            placeholder="Search spaces"
            aria-label="Search spaces"
            className="dx-field py-1.5 pl-9 text-[0.8125rem]"
          />
        </div>

        <label htmlFor={`${fieldId}-level`} className="sr-only">
          Level
        </label>
        <select
          id={`${fieldId}-level`}
          value={filters.level}
          onChange={(event) => set('level', event.target.value)}
          className="dx-field w-auto py-1.5 text-[0.8125rem]"
        >
          <option value="all">Every level</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <label htmlFor={`${fieldId}-kind`} className="sr-only">
          Space type
        </label>
        <select
          id={`${fieldId}-kind`}
          value={filters.kind}
          onChange={(event) => set('kind', event.target.value)}
          className="dx-field w-auto py-1.5 text-[0.8125rem]"
        >
          <option value="all">Any type</option>
          {SPACE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={`${fieldId}-more`}
          className={cn('dx-btn-ghost px-2.5 py-1.5', open && 'bg-nt-100 text-ink')}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          More
          {refined > 0 && (
            <span className="rounded-full bg-brand-600 px-1.5 text-[0.625rem] font-medium text-nt-0">
              {refined}
            </span>
          )}
        </button>

        {refined > 0 && (
          <button
            type="button"
            onClick={() => onFilters({ ...NO_FILTERS, query: filters.query })}
            className="dx-btn-ghost px-2.5 py-1.5"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div id={`${fieldId}-more`} className="space-y-3.5 border-t border-line bg-nt-50 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <label htmlFor={`${fieldId}-capacity`} className="dx-eyebrow shrink-0">
              Seats at least
            </label>
            <input
              id={`${fieldId}-capacity`}
              type="number"
              min={1}
              max={40}
              value={filters.capacity}
              onChange={(event) => set('capacity', Math.max(1, Number(event.target.value)))}
              className="dx-field w-20 py-1.5 text-[0.8125rem] tabular-nums"
            />
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-2">Must have</legend>
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[0.6875rem] transition-all duration-[180ms]',
                      active
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                        : 'border-line bg-nt-0 text-ink-muted hover:border-line-strong',
                    )}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
