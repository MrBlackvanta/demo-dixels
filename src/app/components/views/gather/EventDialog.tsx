import { useId, useState } from 'react';
import { Check, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { todayKey } from '../../../lib/format';
import { PEOPLE } from '../../../lib/seed';
import type { Booking, EventCategory, EventMode, GatherEvent, Space } from '../../../lib/data';
import { CATEGORIES, MODES, toMinutes } from './events';

export interface Draft {
  title: string;
  category: EventCategory;
  mode: EventMode;
  date: string;
  start: string;
  end: string;
  spaceId: string;
  location: string;
  host: string;
  capacity: number;
  price: number;
  required: boolean;
  summary: string;
  tags: string;
}

type Errors = Partial<Record<keyof Draft, string>>;

const DAY_OPENS = 7 * 60;
const DAY_CLOSES = 21 * 60;

const FOCUS_ORDER: Array<keyof Draft> = [
  'title',
  'date',
  'start',
  'end',
  'spaceId',
  'location',
  'capacity',
  'summary',
];

export const emptyDraft = (date: string): Draft => ({
  title: '',
  category: 'Social',
  mode: 'In person',
  date,
  start: '12:00',
  end: '13:00',
  spaceId: '',
  location: '',
  host: PEOPLE[0].name,
  capacity: 20,
  price: 0,
  required: false,
  summary: '',
  tags: '',
});

export const draftFrom = (event: GatherEvent): Draft => ({
  title: event.title,
  category: event.category,
  mode: event.mode,
  date: event.date,
  start: event.start,
  end: event.end,
  spaceId: event.spaceId ?? '',
  location: event.location,
  host: event.host,
  capacity: event.capacity,
  price: event.price,
  required: event.required,
  summary: event.summary,
  tags: event.tags.join(', '),
});

const clashFor = (
  bookings: Booking[],
  draft: Draft,
  eventId?: string,
): Booking | undefined =>
  bookings.find(
    (booking) =>
      booking.spaceId === draft.spaceId &&
      booking.date === draft.date &&
      booking.eventId !== eventId &&
      booking.status !== 'cancelled' &&
      booking.status !== 'declined' &&
      toMinutes(draft.start) < toMinutes(booking.end) &&
      toMinutes(booking.start) < toMinutes(draft.end),
  );

const validate = (
  draft: Draft,
  spaces: Space[],
  bookings: Booking[],
  editing: GatherEvent | null,
): Errors => {
  const errors: Errors = {};
  const space = spaces.find((row) => row.id === draft.spaceId);

  if (!draft.title.trim()) errors.title = 'Give it a name people will recognise.';

  if (!draft.date) errors.date = 'Pick a date.';
  else if (!editing && draft.date < todayKey()) errors.date = 'That date has already passed.';

  if (!draft.start) errors.start = 'Pick a start time.';
  else if (toMinutes(draft.start) < DAY_OPENS) errors.start = 'The building opens at 07:00.';

  if (!draft.end) errors.end = 'Pick an end time.';
  else if (toMinutes(draft.end) <= toMinutes(draft.start)) errors.end = 'It has to end after it starts.';
  else if (toMinutes(draft.end) > DAY_CLOSES) errors.end = 'The building closes at 21:00.';

  if (draft.spaceId) {
    if (space?.offline) errors.spaceId = `${space.name} is offline right now.`;
    else if (space && draft.capacity > space.capacity) {
      errors.capacity = `${space.name} only seats ${space.capacity}.`;
    }
  } else if (!draft.location.trim()) {
    errors.location = 'Say where it happens, or pick a room.';
  }

  if (draft.capacity < 1) errors.capacity = 'At least one seat.';
  else if (editing && draft.capacity < editing.going.length) {
    errors.capacity = `${editing.going.length} people are already in.`;
  }

  if (!draft.summary.trim()) errors.summary = 'One line on why someone should come.';

  if (space && !errors.spaceId && !errors.date && !errors.start && !errors.end) {
    const clash = clashFor(bookings, draft, editing?.id);
    if (clash) errors.start = `${space.name} is taken ${clash.start}–${clash.end} for ${clash.purpose}.`;
  }

  return errors;
};

interface EventDialogProps {
  spaces: Space[];
  bookings: Booking[];
  editing: GatherEvent | null;
  initial: Draft;
  onClose: () => void;
  onSave: (draft: Draft, editing: GatherEvent | null) => void;
}

export function EventDialog({
  spaces,
  bookings,
  editing,
  initial,
  onClose,
  onSave,
}: EventDialogProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState<Draft>(initial);
  const [touched, setTouched] = useState(false);

  const errors = validate(draft, spaces, bookings, editing);
  const space = spaces.find((row) => row.id === draft.spaceId);
  const blocker = errors.spaceId ?? errors.start ?? errors.end ?? errors.capacity ?? errors.date;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const pickSpace = (spaceId: string) => {
    const picked = spaces.find((row) => row.id === spaceId);
    setDraft((prev) => ({
      ...prev,
      spaceId,
      location: picked ? `${picked.name} · ${picked.level}` : '',
      capacity: picked ? Math.min(prev.capacity, picked.capacity) : prev.capacity,
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);

    const firstInvalid = FOCUS_ORDER.find((key) => errors[key]);
    if (firstInvalid) {
      document.getElementById(`${fieldId}-${firstInvalid}`)?.focus();
      return;
    }

    onSave(draft, editing);
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
        aria-labelledby={`${fieldId}-title-heading`}
        className="dx-card relative flex w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={`${fieldId}-title-heading`} className="dx-h4">
              {editing ? 'Edit this event' : 'Host something'}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {editing
                ? 'Everyone who signed up sees the change straight away.'
                : 'Pick a room and it is held in SpaceOS the moment you publish.'}
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
            <label htmlFor={`${fieldId}-title`} className="dx-eyebrow mb-1.5 block">
              What is it
            </label>
            <input
              {...field('title')}
              type="text"
              value={draft.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Lunch & Learn: Design Systems"
              className="dx-field"
            />
            {errorFor('title')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-category`} className="dx-eyebrow mb-1.5 block">
                Kind
              </label>
              <select
                {...field('category')}
                value={draft.category}
                onChange={(event) => set('category', event.target.value as EventCategory)}
                className="dx-field"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${fieldId}-mode`} className="dx-eyebrow mb-1.5 block">
                How to attend
              </label>
              <select
                {...field('mode')}
                value={draft.mode}
                onChange={(event) => set('mode', event.target.value as EventMode)}
                className="dx-field"
              >
                {MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
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
                onChange={(event) => set('start', event.target.value)}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-spaceId`} className="dx-eyebrow mb-1.5 block">
                Room
              </label>
              <select
                {...field('spaceId')}
                value={draft.spaceId}
                onChange={(event) => pickSpace(event.target.value)}
                className="dx-field"
              >
                <option value="">Somewhere else</option>
                {spaces.map((row) => (
                  <option key={row.id} value={row.id} disabled={row.offline}>
                    {row.name} · {row.level} · {row.capacity}
                    {row.offline ? ' · offline' : ''}
                  </option>
                ))}
              </select>
              {errorFor('spaceId')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-location`} className="dx-eyebrow mb-1.5 block">
                Where people go
              </label>
              <input
                {...field('location')}
                type="text"
                value={draft.location}
                onChange={(event) => set('location', event.target.value)}
                placeholder="Roof Garden · Level 7"
                className="dx-field"
              />
              {errorFor('location')}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor={`${fieldId}-host`} className="dx-eyebrow mb-1.5 block">
                Host
              </label>
              <select
                {...field('host')}
                value={draft.host}
                onChange={(event) => set('host', event.target.value)}
                className="dx-field"
              >
                {PEOPLE.map((person) => (
                  <option key={person.name} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${fieldId}-capacity`} className="dx-eyebrow mb-1.5 block">
                Seats
              </label>
              <input
                {...field('capacity')}
                type="number"
                min={1}
                max={space?.capacity ?? 500}
                value={draft.capacity}
                onChange={(event) => set('capacity', Number(event.target.value))}
                className="dx-field tabular-nums"
              />
              {errorFor('capacity')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-price`} className="dx-eyebrow mb-1.5 block">
                Price (SAR)
              </label>
              <input
                {...field('price')}
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) => set('price', Number(event.target.value))}
                className="dx-field tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-summary`} className="dx-eyebrow mb-1.5 block">
              The pitch
            </label>
            <textarea
              {...field('summary')}
              rows={3}
              value={draft.summary}
              onChange={(event) => set('summary', event.target.value)}
              placeholder="What people get out of an hour of their day."
              className="dx-field resize-none"
            />
            {errorFor('summary')}
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor={`${fieldId}-tags`} className="dx-eyebrow mb-1.5 block">
                Tags
              </label>
              <input
                {...field('tags')}
                type="text"
                value={draft.tags}
                onChange={(event) => set('tags', event.target.value)}
                placeholder="Design, Workshop"
                className="dx-field"
              />
            </div>

            <label className="flex items-center gap-2 pb-2.5 text-[0.8125rem] text-ink sm:self-end">
              <input
                type="checkbox"
                checked={draft.required}
                onChange={(event) => set('required', event.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-brand-600"
              />
              Attendance expected
            </label>
          </div>

          {draft.spaceId && (
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
              {blocker ?? `${space?.name} is free then — publishing holds it in SpaceOS.`}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-4">
          <p className="text-[0.6875rem] text-ink-subtle">
            {editing ? `${editing.going.length} already signed up` : 'Saves as a draft you can publish'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dx-btn-primary">
              {editing ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
