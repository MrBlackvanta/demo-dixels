import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import type { Space, SpaceKind } from '../../../lib/data';
import { AMENITIES, SPACE_KINDS } from './spaces';

type Draft = {
  name: string;
  kind: SpaceKind;
  level: string;
  capacity: number;
  amenities: string[];
  approval: boolean;
  offline: boolean;
  note: string;
};

type Errors = Partial<Record<keyof Draft, string>>;

const FOCUS_ORDER: Array<keyof Draft> = ['name', 'level', 'capacity', 'note'];

const emptyDraft = (level: string): Draft => ({
  name: '',
  kind: 'Meeting room',
  level,
  capacity: 6,
  amenities: [],
  approval: false,
  offline: false,
  note: '',
});

const fromSpace = (space: Space): Draft => ({
  name: space.name,
  kind: space.kind,
  level: space.level,
  capacity: space.capacity,
  amenities: space.amenities,
  approval: space.approval,
  offline: space.offline,
  note: space.note ?? '',
});

const validate = (draft: Draft, taken: string[]): Errors => {
  const errors: Errors = {};
  const name = draft.name.trim();

  if (!name) errors.name = 'Give it a name people will recognise.';
  else if (taken.includes(name.toLowerCase())) errors.name = 'A space already goes by that name.';

  if (!draft.level.trim()) errors.level = 'Which level is it on?';

  if (!Number.isFinite(draft.capacity) || draft.capacity < 1) errors.capacity = 'At least one seat.';
  else if (draft.capacity > 200) errors.capacity = 'That is a stadium, not a room.';

  if (draft.offline && !draft.note.trim()) errors.note = 'Say why, so people stop asking.';

  return errors;
};

interface SpaceDialogProps {
  editing: Space | null;
  levels: string[];
  taken: string[];
  onClose: () => void;
  onSave: (draft: Draft, editing: Space | null) => void;
}

export function SpaceDialog({ editing, levels, taken, onClose, onSave }: SpaceDialogProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState<Draft>(() =>
    editing ? fromSpace(editing) : emptyDraft(levels[0] ?? 'Level 1'),
  );
  const [touched, setTouched] = useState(false);

  const errors = validate(draft, taken);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (amenity: string) =>
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((row) => row !== amenity)
        : [...prev.amenities, amenity],
    }));

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
        aria-labelledby={`${fieldId}-title`}
        className="dx-card relative flex w-full max-w-lg flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={`${fieldId}-title`} className="dx-h4">
              {editing ? `Edit ${editing.name}` : 'Add a space'}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              This is what everyone in the building sees when they book.
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
            <label htmlFor={`${fieldId}-name`} className="dx-eyebrow mb-1.5 block">
              Name
            </label>
            <input
              {...field('name')}
              type="text"
              value={draft.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="Orchid"
              className="dx-field"
            />
            {errorFor('name')}
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-2.5">Type</legend>
            <div className="flex flex-wrap gap-2">
              {SPACE_KINDS.map((kind) => {
                const active = draft.kind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set('kind', kind)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                      active
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                        : 'border-line bg-nt-0 text-ink hover:border-line-strong hover:bg-nt-50',
                    )}
                  >
                    {kind}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-level`} className="dx-eyebrow mb-1.5 block">
                Level
              </label>
              <input
                {...field('level')}
                type="text"
                list={`${fieldId}-levels`}
                value={draft.level}
                onChange={(event) => set('level', event.target.value)}
                className="dx-field"
              />
              <datalist id={`${fieldId}-levels`}>
                {levels.map((level) => (
                  <option key={level} value={level} />
                ))}
              </datalist>
              {errorFor('level')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-capacity`} className="dx-eyebrow mb-1.5 block">
                Seats
              </label>
              <input
                {...field('capacity')}
                type="number"
                min={1}
                max={200}
                value={draft.capacity}
                onChange={(event) => set('capacity', Number(event.target.value))}
                className="dx-field tabular-nums"
              />
              {errorFor('capacity')}
            </div>
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-2.5">What is in it</legend>
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((amenity) => {
                const active = draft.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[0.75rem] transition-all duration-[180ms]',
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

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-line px-3.5 py-3 transition-colors duration-[180ms] hover:bg-nt-50">
            <span>
              <span className="block text-[0.8125rem] font-medium text-ink">Needs approval</span>
              <span className="block text-[0.6875rem] text-ink-muted">
                Requests wait for facilities before they are final
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.approval}
              onChange={(event) => set('approval', event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-line px-3.5 py-3 transition-colors duration-[180ms] hover:bg-nt-50">
            <span>
              <span className="block text-[0.8125rem] font-medium text-ink">Take it offline</span>
              <span className="block text-[0.6875rem] text-ink-muted">
                Nobody can book it until you bring it back
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.offline}
              onChange={(event) => set('offline', event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>

          {draft.offline && (
            <div>
              <label htmlFor={`${fieldId}-note`} className="dx-eyebrow mb-1.5 block">
                Why it is offline
              </label>
              <input
                {...field('note')}
                type="text"
                value={draft.note}
                onChange={(event) => set('note', event.target.value)}
                placeholder="Monitor arm replacement — back Thursday."
                className="dx-field"
              />
              {errorFor('note')}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editing ? 'Save changes' : 'Add the space'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export type { Draft as SpaceDraft };
