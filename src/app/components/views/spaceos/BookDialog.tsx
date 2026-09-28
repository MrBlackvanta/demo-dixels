import { useId, useState } from 'react';
import { Check, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { todayKey } from '../../../lib/format';
import type { Booking, Space } from '../../../lib/data';
import {
  DAY_END,
  DAY_START,
  DURATIONS,
  addMinutes,
  conflictFor,
  groupByLevel,
  lengthLabel,
  toClock,
  toMinutes,
} from './spaces';

type Draft = {
  spaceId: string;
  date: string;
  start: string;
  end: string;
  purpose: string;
  attendees: number;
};

type Errors = Partial<Record<keyof Draft, string>>;

const OPENS = toClock(DAY_START * 60);
const CLOSES = toClock(DAY_END * 60);

const FOCUS_ORDER: Array<keyof Draft> = ['spaceId', 'date', 'start', 'end', 'purpose', 'attendees'];

const fromBooking = (booking: Booking): Draft => ({
  spaceId: booking.spaceId ?? '',
  date: booking.date,
  start: booking.start,
  end: booking.end,
  purpose: booking.purpose,
  attendees: booking.attendees ?? 1,
});

const validate = (draft: Draft, spaces: Space[], bookings: Booking[], editingId?: string): Errors => {
  const errors: Errors = {};
  const space = spaces.find((row) => row.id === draft.spaceId);

  if (!space) errors.spaceId = 'Pick a space.';
  else if (space.offline) errors.spaceId = `${space.name} is offline right now.`;

  if (!draft.date) errors.date = 'Pick a date.';
  else if (draft.date < todayKey()) errors.date = 'That date has already passed.';

  if (!draft.start) errors.start = 'Pick a start time.';
  else if (toMinutes(draft.start) < DAY_START * 60) errors.start = `The building opens at ${OPENS}.`;

  if (!draft.end) errors.end = 'Pick an end time.';
  else if (toMinutes(draft.end) <= toMinutes(draft.start)) errors.end = 'It has to end after it starts.';
  else if (toMinutes(draft.end) > DAY_END * 60) errors.end = `The building closes at ${CLOSES}.`;

  if (!draft.purpose.trim()) errors.purpose = 'Name it, so the room card makes sense.';

  if (space && draft.attendees > space.capacity) {
    errors.attendees = `${space.name} seats ${space.capacity}.`;
  } else if (draft.attendees < 1) {
    errors.attendees = 'At least one of you.';
  }

  if (space && !errors.spaceId && !errors.date && !errors.start && !errors.end) {
    const clash = conflictFor(bookings, space.id, draft.date, draft.start, draft.end, editingId);
    if (clash) errors.start = `Taken ${clash.start}–${clash.end} for ${clash.purpose}.`;
  }

  return errors;
};

interface BookDialogProps {
  spaces: Space[];
  bookings: Booking[];
  editing: Booking | null;
  initial: Draft;
  onClose: () => void;
  onSave: (draft: Draft, space: Space, editing: Booking | null) => void;
}

export function BookDialog({ spaces, bookings, editing, initial, onClose, onSave }: BookDialogProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState<Draft>(() => (editing ? fromBooking(editing) : initial));
  const [touched, setTouched] = useState(false);

  const errors = validate(draft, spaces, bookings, editing?.id);
  const space = spaces.find((row) => row.id === draft.spaceId);
  const blocker = errors.spaceId ?? errors.date ?? errors.start ?? errors.end ?? errors.attendees;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setStart = (start: string) => {
    const length = Math.max(toMinutes(draft.end) - toMinutes(draft.start), 30);
    setDraft((prev) => ({ ...prev, start, end: addMinutes(start, length) }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);

    const firstInvalid = FOCUS_ORDER.find((key) => errors[key]);
    if (firstInvalid) {
      document.getElementById(`${fieldId}-${firstInvalid}`)?.focus();
      return;
    }

    if (space) onSave(draft, space, editing);
  };

  const field = (key: keyof Draft) => ({
    id: `${fieldId}-${key}`,
    'aria-invalid': touched && Boolean(errors[key]),
    'aria-describedby': touched && errors[key] ? `${fieldId}-${key}-error` : undefined,
  });

  const errorFor = (key: keyof Draft) =>
    touched && errors[key] ? (
      <p id={`${fieldId}-${key}-error`} role="alert" className="mt-1.5 text-[0.6875rem] text-danger">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        className="dx-card relative flex w-full max-w-xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={`${fieldId}-title`} className="dx-h4">
              {editing ? 'Move this booking' : 'Hold a space'}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {editing
                ? 'Everyone on the invite sees the new time.'
                : 'Nobody else can take the slot once you confirm.'}
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor={`${fieldId}-spaceId`} className="dx-eyebrow mb-1.5 block">
              Space
            </label>
            <select
              {...field('spaceId')}
              value={draft.spaceId}
              onChange={(event) => set('spaceId', event.target.value)}
              className="dx-field"
            >
              <option value="">Choose a space</option>
              {groupByLevel(spaces).map((group) => (
                <optgroup key={group.level} label={group.level}>
                  {group.spaces.map((row) => (
                    <option key={row.id} value={row.id} disabled={row.offline}>
                      {row.name} · {row.kind} · {row.capacity}
                      {row.offline ? ' · offline' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errorFor('spaceId')}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor={`${fieldId}-date`} className="dx-eyebrow mb-1.5 block">
                Date
              </label>
              <input
                {...field('date')}
                type="date"
                value={draft.date}
                min={todayKey()}
                onChange={(event) => set('date', event.target.value)}
                className="dx-field"
              />
              {errorFor('date')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-start`} className="dx-eyebrow mb-1.5 block">
                From
              </label>
              <input
                {...field('start')}
                type="time"
                step={1800}
                value={draft.start}
                onChange={(event) => setStart(event.target.value)}
                className="dx-field"
              />
            </div>

            <div>
              <label htmlFor={`${fieldId}-end`} className="dx-eyebrow mb-1.5 block">
                Until
              </label>
              <input
                {...field('end')}
                type="time"
                step={1800}
                value={draft.end}
                onChange={(event) => set('end', event.target.value)}
                className="dx-field"
              />
              {errorFor('end')}
            </div>
          </div>

          {errorFor('start')}

          <fieldset>
            <legend className="dx-eyebrow mb-2.5">How long</legend>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((minutes) => {
                const end = addMinutes(draft.start, minutes);
                const active = draft.end === end;
                return (
                  <button
                    key={minutes}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set('end', end)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                      active
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                        : 'border-line bg-nt-0 text-ink hover:border-line-strong hover:bg-nt-50',
                    )}
                  >
                    {lengthLabel(draft.start, end)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <div>
              <label htmlFor={`${fieldId}-purpose`} className="dx-eyebrow mb-1.5 block">
                What for
              </label>
              <input
                {...field('purpose')}
                type="text"
                value={draft.purpose}
                onChange={(event) => set('purpose', event.target.value)}
                placeholder="Design sync"
                className="dx-field"
              />
              {errorFor('purpose')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-attendees`} className="dx-eyebrow mb-1.5 block">
                People
              </label>
              <input
                {...field('attendees')}
                type="number"
                min={1}
                max={space?.capacity ?? 99}
                value={draft.attendees}
                onChange={(event) => set('attendees', Number(event.target.value))}
                className="dx-field tabular-nums"
              />
              {errorFor('attendees')}
            </div>
          </div>

          {space && (
            <p
              className={cn(
                'flex items-start gap-2 rounded-md px-3.5 py-3 text-[0.8125rem]',
                blocker ? 'bg-warning-bg text-warning' : 'bg-grn-50 text-grn-700',
              )}
            >
              {blocker ? (
                <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              {blocker ??
                (space.approval
                  ? `${space.name} is free — the facilities team approves this one before it is final.`
                  : `${space.name} is free then. It is yours the moment you confirm.`)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-4">
          <p className="text-[0.6875rem] text-ink-subtle">
            {space ? `${space.level} · ${lengthLabel(draft.start, draft.end)}` : 'No space chosen'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dx-btn-primary">
              {editing ? 'Save changes' : 'Confirm booking'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export type { Draft };
