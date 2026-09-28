import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../../shell/Modal';
import { PEOPLE } from '../../../lib/seed';
import type { Tribe, TribeAccess, TribeCategory } from '../../../lib/data';
import { CATEGORIES } from './community';

export interface Draft {
  name: string;
  category: TribeCategory;
  tagline: string;
  about: string;
  lead: string;
  home: string;
  access: TribeAccess;
  tags: string;
}

type Errors = Partial<Record<keyof Draft, string>>;

const TAGLINE_MAX = 90;
const ABOUT_MIN = 40;

const FOCUS_ORDER: Array<keyof Draft> = ['name', 'tagline', 'about', 'home'];

export const emptyDraft = (): Draft => ({
  name: '',
  category: 'Social',
  tagline: '',
  about: '',
  lead: PEOPLE[0].name,
  home: '',
  access: 'open',
  tags: '',
});

export const draftFrom = (tribe: Tribe): Draft => ({
  name: tribe.name,
  category: tribe.category,
  tagline: tribe.tagline,
  about: tribe.about,
  lead: tribe.lead,
  home: tribe.home,
  access: tribe.access,
  tags: tribe.tags.join(', '),
});

const validate = (draft: Draft, tribes: Tribe[], editing: Tribe | null): Errors => {
  const errors: Errors = {};
  const name = draft.name.trim();

  if (!name) errors.name = 'Give it a name people will search for.';
  else if (
    tribes.some((row) => row.id !== editing?.id && row.name.toLowerCase() === name.toLowerCase())
  ) {
    errors.name = 'A tribe already goes by that name.';
  }

  if (!draft.tagline.trim()) errors.tagline = 'One line on what this is.';
  else if (draft.tagline.length > TAGLINE_MAX) {
    errors.tagline = `Keep it under ${TAGLINE_MAX} characters.`;
  }

  if (draft.about.trim().length < ABOUT_MIN) {
    errors.about = 'Say enough that someone can decide whether it is for them.';
  }

  if (!draft.home.trim()) errors.home = 'Where does it usually happen?';

  return errors;
};

interface TribeDialogProps {
  tribes: Tribe[];
  editing: Tribe | null;
  initial: Draft;
  onClose: () => void;
  onSave: (draft: Draft, editing: Tribe | null) => void;
}

export function TribeDialog({ tribes, editing, initial, onClose, onSave }: TribeDialogProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState<Draft>(initial);
  const [touched, setTouched] = useState(false);

  const errors = validate(draft, tribes, editing);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

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
        aria-labelledby={`${fieldId}-heading`}
        className="dx-card relative flex w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id={`${fieldId}-heading`} className="dx-h4">
              {editing ? 'Edit this tribe' : 'Start a tribe'}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {editing
                ? `${editing.members.length} people see this change straight away.`
                : 'The lead becomes the first member and can approve everyone after.'}
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
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor={`${fieldId}-name`} className="dx-eyebrow mb-1.5 block">
                Name
              </label>
              <input
                {...field('name')}
                type="text"
                value={draft.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder="Climbing Club"
                className="dx-field"
              />
              {errorFor('name')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-category`} className="dx-eyebrow mb-1.5 block">
                Kind
              </label>
              <select
                {...field('category')}
                value={draft.category}
                onChange={(event) => set('category', event.target.value as TribeCategory)}
                className="dx-field"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-tagline`} className="dx-eyebrow mb-1.5 block">
              The one-liner
            </label>
            <input
              {...field('tagline')}
              type="text"
              value={draft.tagline}
              onChange={(event) => set('tagline', event.target.value)}
              placeholder="Thursday evenings at the wall, all grades welcome."
              className="dx-field"
            />
            <p className="mt-1.5 text-[0.6875rem] text-ink-subtle">
              {draft.tagline.length}/{TAGLINE_MAX}
            </p>
            {errorFor('tagline')}
          </div>

          <div>
            <label htmlFor={`${fieldId}-about`} className="dx-eyebrow mb-1.5 block">
              What it is
            </label>
            <textarea
              {...field('about')}
              rows={4}
              value={draft.about}
              onChange={(event) => set('about', event.target.value)}
              placeholder="Who it is for, how often you meet, and what someone should expect the first time they turn up."
              className="dx-field resize-none"
            />
            {errorFor('about')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-lead`} className="dx-eyebrow mb-1.5 block">
                Lead
              </label>
              <select
                {...field('lead')}
                value={draft.lead}
                onChange={(event) => set('lead', event.target.value)}
                className="dx-field"
              >
                {PEOPLE.map((person) => (
                  <option key={person.name} value={person.name}>
                    {person.name} · {person.team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${fieldId}-home`} className="dx-eyebrow mb-1.5 block">
                Usual spot
              </label>
              <input
                {...field('home')}
                type="text"
                value={draft.home}
                onChange={(event) => set('home', event.target.value)}
                placeholder="Skyline Lounge · Level 6"
                className="dx-field"
              />
              {errorFor('home')}
            </div>
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
                placeholder="Climbing, Evening"
                className="dx-field"
              />
            </div>

            <div>
              <label htmlFor={`${fieldId}-access`} className="dx-eyebrow mb-1.5 block">
                Joining
              </label>
              <select
                {...field('access')}
                value={draft.access}
                onChange={(event) => set('access', event.target.value as TribeAccess)}
                className="dx-field"
              >
                <option value="open">Anyone can join</option>
                <option value="request">The lead approves</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editing ? 'Save changes' : 'Create tribe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
