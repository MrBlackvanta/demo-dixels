import { useId, useState } from 'react';
import { ArrowRight, SearchX, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { formatDay } from '../../../lib/format';
import type { Booking, Space } from '../../../lib/data';
import { AMENITIES, DURATIONS, KIND_ICON, clockNow, minutesLabel, suggest } from './spaces';
import type { Criteria, Suggestion } from './spaces';

interface FindDialogProps {
  spaces: Space[];
  bookings: Booking[];
  date: string;
  onClose: () => void;
  onPick: (suggestion: Suggestion) => void;
}

export function FindDialog({ spaces, bookings, date, onClose, onPick }: FindDialogProps) {
  const fieldId = useId();
  const [criteria, setCriteria] = useState<Criteria>(() => ({
    headcount: 4,
    duration: 60,
    from: clockNow(),
    amenities: [],
  }));

  const results = suggest(spaces, bookings, date, criteria);

  const set = <K extends keyof Criteria>(key: K, value: Criteria[K]) =>
    setCriteria((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (amenity: string) =>
    setCriteria((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((row) => row !== amenity)
        : [...prev.amenities, amenity],
    }));

  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        className="dx-card relative flex w-full max-w-xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={`${fieldId}-title`} className="dx-h4">
              Find me a space
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              Tell it what you need and it returns the earliest slot in every room that fits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-[180ms] hover:bg-nt-100 hover:text-ink"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 border-b border-line px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldId}-headcount`} className="dx-eyebrow mb-1.5 block">
                  People
                </label>
                <input
                  id={`${fieldId}-headcount`}
                  type="number"
                  min={1}
                  max={40}
                  value={criteria.headcount}
                  onChange={(event) => set('headcount', Math.max(1, Number(event.target.value)))}
                  className="dx-field tabular-nums"
                />
              </div>

              <div>
                <label htmlFor={`${fieldId}-from`} className="dx-eyebrow mb-1.5 block">
                  From
                </label>
                <input
                  id={`${fieldId}-from`}
                  type="time"
                  step={1800}
                  value={criteria.from}
                  onChange={(event) => set('from', event.target.value)}
                  className="dx-field"
                />
              </div>
            </div>

            <fieldset>
              <legend className="dx-eyebrow mb-2.5">For how long</legend>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((minutes) => {
                  const active = criteria.duration === minutes;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set('duration', minutes)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                        active
                          ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'border-line bg-nt-0 text-ink hover:border-line-strong hover:bg-nt-50',
                      )}
                    >
                      {minutesLabel(minutes)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="dx-eyebrow mb-2.5">
                Must have
                <span className="ml-1.5 normal-case tracking-normal text-ink-subtle">optional</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => {
                  const active = criteria.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[0.75rem] transition-all duration-[180ms]',
                        active
                          ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'border-line bg-nt-0 text-ink-muted hover:border-line-strong hover:bg-nt-50',
                      )}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="px-6 py-5">
            <p className="dx-eyebrow mb-3">
              {results.length === 0
                ? 'Nothing fits'
                : `${results.length} ${results.length === 1 ? 'space fits' : 'spaces fit'} · ${formatDay(date)}`}
            </p>

            {results.length === 0 ? (
              <div className="grid place-items-center rounded-md bg-nt-50 px-6 py-8 text-center">
                <div>
                  <SearchX size={20} className="mx-auto mb-2.5 text-ink-subtle" aria-hidden="true" />
                  <p className="text-[0.8125rem] text-ink">
                    Nothing seats {criteria.headcount} for {minutesLabel(criteria.duration)} after {criteria.from}.
                  </p>
                  <p className="mt-1 text-[0.75rem] text-ink-muted">
                    Try a shorter hold, an earlier start, or fewer must-haves.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {results.map((result) => {
                  const Icon = KIND_ICON[result.space.kind];
                  return (
                    <li key={result.space.id}>
                      <button
                        type="button"
                        onClick={() => onPick(result)}
                        className="group flex w-full items-center gap-3 rounded-md border border-line px-3.5 py-3 text-left transition-all duration-[180ms] hover:border-brand-300 hover:bg-brand-50"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-nt-100 text-ink-muted group-hover:bg-nt-0"
                        >
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.875rem] font-medium text-ink">
                            {result.space.name}
                          </span>
                          <span className="block truncate text-[0.75rem] text-ink-muted">
                            {result.space.level} · seats {result.space.capacity}
                            {result.space.approval && ' · needs approval'}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[0.8125rem] font-medium tabular-nums text-ink">
                            {result.start}–{result.end}
                          </span>
                          <span className="block text-[0.6875rem] text-ink-muted">earliest</span>
                        </span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-ink-subtle transition-transform duration-[180ms] group-hover:translate-x-0.5 group-hover:text-brand-600"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
