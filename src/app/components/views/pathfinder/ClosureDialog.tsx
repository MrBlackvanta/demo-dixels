import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { todayKey } from '../../../lib/format';
import { levelShort } from '../../../lib/wayfinding';
import type { Closure, ClosureScope, Place } from '../../../lib/data';

export interface ClosureDraft {
  title: string;
  scope: ClosureScope;
  targetId: string;
  reason: string;
  from: string;
  until: string;
  active: boolean;
}

export const blankClosure = (): ClosureDraft => ({
  title: '',
  scope: 'core',
  targetId: '',
  reason: '',
  from: todayKey(),
  until: todayKey(),
  active: true,
});

export const draftFromClosure = (closure: Closure): ClosureDraft => ({
  title: closure.title,
  scope: closure.scope,
  targetId: closure.targetId,
  reason: closure.reason,
  from: closure.from,
  until: closure.until,
  active: closure.active,
});

interface Errors {
  title?: string;
  target?: string;
  reason?: string;
  until?: string;
}

const FOCUS_ORDER: Array<keyof Errors> = ['title', 'target', 'reason', 'until'];

interface ClosureDialogProps {
  initial: ClosureDraft;
  editingId?: string;
  places: Place[];
  onClose: () => void;
  onSave: (draft: ClosureDraft) => void;
}

export function ClosureDialog({
  initial,
  editingId,
  places,
  onClose,
  onSave,
}: ClosureDialogProps) {
  const [draft, setDraft] = useState<ClosureDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ClosureDraft>(key: K, value: ClosureDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const cores = [...new Map(
    places
      .filter((place) => place.coreId !== undefined)
      .map((place) => [place.coreId!, place.name]),
  ).entries()];

  const single = places
    .filter((place) => place.coreId === undefined)
    .sort((a, b) => a.level.localeCompare(b.level, undefined, { numeric: true }) || a.name.localeCompare(b.name));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.title.trim().length < 4) found.title = 'Say what is shut, in a few words.';
    if (draft.targetId === '') found.target = 'Pick what this closes.';
    if (draft.reason.trim().length < 10)
      found.reason = 'People will read this instead of asking. Give them the why and the way round.';
    if (draft.until < draft.from) found.until = 'The end date cannot be before the start.';

    setErrors(found);

    const first = FOCUS_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(`closure-${first}`)?.focus();
      return;
    }

    onSave({ ...draft, title: draft.title.trim(), reason: draft.reason.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Pathfinder</p>
            <h2 className="dx-h4">{editingId ? 'Edit this closure' : 'Close something off'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              While this is in force nobody gets routed through it, and everyone sees why.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="dx-btn-ghost -mr-2 -mt-1 shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="closure-title" className="dx-eyebrow mb-1.5 block">
              What is shut
            </label>
            <input
              id="closure-title"
              type="text"
              value={draft.title}
              data-autofocus
              maxLength={60}
              onChange={(event) => set('title', event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'closure-title-error' : undefined}
              placeholder="North stairs shut between Levels 2 and 4"
              className={cn('dx-field', errors.title && 'border-danger')}
            />
            {errors.title && (
              <p id="closure-title-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="closure-scope" className="dx-eyebrow mb-1.5 block">
                Kind
              </label>
              <select
                id="closure-scope"
                value={draft.scope}
                onChange={(event) => {
                  const scope = event.target.value as ClosureScope;
                  setDraft((current) => ({ ...current, scope, targetId: '' }));
                }}
                className="dx-field"
              >
                <option value="core">A lift or stair core</option>
                <option value="place">One place</option>
              </select>
            </div>

            <div>
              <label htmlFor="closure-target" className="dx-eyebrow mb-1.5 block">
                {draft.scope === 'core' ? 'Which core' : 'Which place'}
              </label>
              <select
                id="closure-target"
                value={draft.targetId}
                onChange={(event) => set('targetId', event.target.value)}
                aria-invalid={Boolean(errors.target)}
                aria-describedby={errors.target ? 'closure-target-error' : undefined}
                className={cn('dx-field', errors.target && 'border-danger')}
              >
                <option value="">Pick one</option>
                {draft.scope === 'core'
                  ? cores.map(([coreId, name]) => (
                      <option key={coreId} value={coreId}>
                        {name}
                      </option>
                    ))
                  : single.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name} · {levelShort(place.level)}
                      </option>
                    ))}
              </select>
              {errors.target && (
                <p
                  id="closure-target-error"
                  role="alert"
                  className="mt-1.5 text-[0.75rem] text-danger"
                >
                  {errors.target}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="closure-from" className="dx-eyebrow mb-1.5 block">
                From
              </label>
              <input
                id="closure-from"
                type="date"
                value={draft.from}
                onChange={(event) => set('from', event.target.value)}
                className="dx-field"
              />
            </div>

            <div>
              <label htmlFor="closure-until" className="dx-eyebrow mb-1.5 block">
                Until
              </label>
              <input
                id="closure-until"
                type="date"
                value={draft.until}
                onChange={(event) => set('until', event.target.value)}
                aria-invalid={Boolean(errors.until)}
                aria-describedby={errors.until ? 'closure-until-error' : undefined}
                className={cn('dx-field', errors.until && 'border-danger')}
              />
              {errors.until && (
                <p
                  id="closure-until-error"
                  role="alert"
                  className="mt-1.5 text-[0.75rem] text-danger"
                >
                  {errors.until}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="closure-reason" className="dx-eyebrow mb-1.5 block">
              Why, and what to do instead
            </label>
            <textarea
              id="closure-reason"
              value={draft.reason}
              rows={3}
              maxLength={260}
              onChange={(event) => set('reason', event.target.value)}
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={errors.reason ? 'closure-reason-error' : undefined}
              placeholder="What happened, how long it will take, and where people should go in the meantime."
              className={cn('dx-field resize-none', errors.reason && 'border-danger')}
            />
            {errors.reason && (
              <p
                id="closure-reason-error"
                role="alert"
                className="mt-1.5 text-[0.75rem] text-danger"
              >
                {errors.reason}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-line px-4 py-3">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => set('active', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-600"
            />
            <span>
              <span className="block text-[0.8125rem] text-ink">Apply it to routes</span>
              <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
                Off keeps the record without changing anybody's walk.
              </span>
            </span>
          </label>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save the closure' : 'Close it off'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
