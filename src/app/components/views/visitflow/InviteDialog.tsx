import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { CURRENT_USER } from '../../../lib/data';
import { todayKey } from '../../../lib/format';
import type { Visit, VisitKind } from '../../../lib/data';
import { LOCATIONS, VISIT_KINDS, newCode } from './visits';

type Draft = {
  guest: string;
  email: string;
  company: string;
  date: string;
  time: string;
  purpose: string;
  kind: VisitKind;
  location: string;
  parking: boolean;
  notes: string;
};

const clockNow = (): string =>
  new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const emptyDraft = (walkIn: boolean): Draft => ({
  guest: '',
  email: '',
  company: '',
  date: todayKey(),
  time: walkIn ? clockNow() : '10:00',
  purpose: '',
  kind: 'Guest',
  location: LOCATIONS[0],
  parking: false,
  notes: '',
});

const fromVisit = (visit: Visit): Draft => ({
  guest: visit.guest,
  email: visit.email ?? '',
  company: visit.company,
  date: visit.date,
  time: visit.time,
  purpose: visit.purpose,
  kind: visit.kind ?? 'Guest',
  location: visit.location ?? LOCATIONS[0],
  parking: visit.parking ?? false,
  notes: visit.notes ?? '',
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FOCUS_ORDER: Array<keyof Draft> = ['guest', 'email', 'company', 'date', 'time', 'purpose'];

const validate = (draft: Draft): Partial<Record<keyof Draft, string>> => {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!draft.guest.trim()) errors.guest = 'Who is visiting?';
  if (!draft.email.trim()) errors.email = 'We send the pass here.';
  else if (!EMAIL.test(draft.email.trim())) errors.email = 'That address looks incomplete.';
  if (!draft.company.trim()) errors.company = 'Add a company, or write Personal.';
  if (!draft.date) errors.date = 'Pick a date.';
  else if (draft.date < todayKey()) errors.date = 'That date has already passed.';
  if (!draft.time) errors.time = 'Pick an arrival time.';
  if (!draft.purpose.trim()) errors.purpose = 'Reception shows this to the guest.';
  return errors;
};

interface InviteDialogProps {
  editing: Visit | null;
  walkIn?: boolean;
  onClose: () => void;
  onSave: (draft: Draft, editing: Visit | null, code: string) => void;
}

export function InviteDialog({ editing, walkIn = false, onClose, onSave }: InviteDialogProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState<Draft>(() =>
    editing ? fromVisit(editing) : emptyDraft(walkIn),
  );
  const [touched, setTouched] = useState(false);

  const errors = validate(draft);
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

    onSave(draft, editing, editing?.code ?? newCode());
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
              {editing ? 'Edit this visit' : walkIn ? 'Register a walk-in' : 'Invite a guest'}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {editing
                ? 'Your guest gets the updated pass by email.'
                : walkIn
                  ? 'They are at the desk now. This issues their pass straight away.'
                  : 'They receive a pass with a code, directions and parking.'}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${fieldId}-guest`} className="dx-eyebrow mb-1.5 block">
                Guest name
              </label>
              <input
                {...field('guest')}
                type="text"
                value={draft.guest}
                onChange={(event) => set('guest', event.target.value)}
                placeholder="Layla Nasser"
                className="dx-field"
              />
              {errorFor('guest')}
            </div>

            <div>
              <label htmlFor={`${fieldId}-email`} className="dx-eyebrow mb-1.5 block">
                Email
              </label>
              <input
                {...field('email')}
                type="email"
                value={draft.email}
                onChange={(event) => set('email', event.target.value)}
                placeholder="layla@northwind.com"
                className="dx-field"
              />
              {errorFor('email')}
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-company`} className="dx-eyebrow mb-1.5 block">
              Company
            </label>
            <input
              {...field('company')}
              type="text"
              value={draft.company}
              onChange={(event) => set('company', event.target.value)}
              placeholder="Northwind"
              className="dx-field"
            />
            {errorFor('company')}
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-2.5">Visit type</legend>
            <div className="flex flex-wrap gap-2">
              {VISIT_KINDS.map((kind) => {
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
              <label htmlFor={`${fieldId}-time`} className="dx-eyebrow mb-1.5 block">
                Arriving
              </label>
              <input
                {...field('time')}
                type="time"
                value={draft.time}
                onChange={(event) => set('time', event.target.value)}
                className="dx-field"
              />
              {errorFor('time')}
            </div>
          </div>

          <div>
            <label htmlFor={`${fieldId}-purpose`} className="dx-eyebrow mb-1.5 block">
              Purpose
            </label>
            <input
              {...field('purpose')}
              type="text"
              value={draft.purpose}
              onChange={(event) => set('purpose', event.target.value)}
              placeholder="Quarterly review"
              className="dx-field"
            />
            {errorFor('purpose')}
          </div>

          <div>
            <label htmlFor={`${fieldId}-location`} className="dx-eyebrow mb-1.5 block">
              Meeting at
            </label>
            <select
              id={`${fieldId}-location`}
              value={draft.location}
              onChange={(event) => set('location', event.target.value)}
              className="dx-field"
            >
              {LOCATIONS.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${fieldId}-notes`} className="dx-eyebrow mb-1.5 block">
              Note for reception
              <span className="ml-1.5 normal-case tracking-normal text-ink-subtle">optional</span>
            </label>
            <textarea
              id={`${fieldId}-notes`}
              value={draft.notes}
              onChange={(event) => set('notes', event.target.value)}
              rows={2}
              placeholder="Please walk them up — the lift needs a badge."
              className="dx-field resize-none"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-line px-3.5 py-3 transition-colors duration-[180ms] hover:bg-nt-50">
            <span>
              <span className="block text-[0.8125rem] font-medium text-ink">Reserve parking</span>
              <span className="block text-[0.6875rem] text-ink-muted">Visitor bay, level B1</span>
            </span>
            <input
              type="checkbox"
              checked={draft.parking}
              onChange={(event) => set('parking', event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-4">
          <p className="text-[0.6875rem] text-ink-subtle">
            Hosted by {editing?.host ?? (walkIn ? 'Front desk' : CURRENT_USER.name)}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dx-btn-primary">
              {editing ? 'Save changes' : walkIn ? 'Register' : 'Send invitation'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export type { Draft };
