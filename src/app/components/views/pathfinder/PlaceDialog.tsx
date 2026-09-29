import { useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { FINDABLE, KIND_LABEL, LEVELS, PLAN_RATIO, SPINE, SPINE_EDGES } from '../../../lib/wayfinding';
import type { Place, PlaceKind } from '../../../lib/data';

export interface PlaceDraft {
  name: string;
  kind: PlaceKind;
  level: string;
  x: number;
  y: number;
  stepFree: boolean;
  detail: string;
  hours: string;
}

export const blankPlace = (level: string): PlaceDraft => ({
  name: '',
  kind: 'pantry',
  level,
  x: 50,
  y: 40,
  stepFree: true,
  detail: '',
  hours: '',
});

export const draftFromPlace = (place: Place): PlaceDraft => ({
  name: place.name,
  kind: place.kind,
  level: place.level,
  x: place.x,
  y: place.y,
  stepFree: place.stepFree,
  detail: place.detail ?? '',
  hours: place.hours ?? '',
});

interface Errors {
  name?: string;
}

const HEIGHT = 100 * PLAN_RATIO;

const spineAt = (key: string) => SPINE.find((point) => point.key === key)!;

interface PlaceDialogProps {
  initial: PlaceDraft;
  editingId?: string;
  neighbours: Place[];
  onClose: () => void;
  onSave: (draft: PlaceDraft) => void;
}

export function PlaceDialog({
  initial,
  editingId,
  neighbours,
  onClose,
  onSave,
}: PlaceDialogProps) {
  const [draft, setDraft] = useState<PlaceDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const plan = useRef<SVGSVGElement>(null);

  const onThisFloor = neighbours.filter(
    (place) => place.level === draft.level && place.id !== editingId,
  );

  const set = <K extends keyof PlaceDraft>(key: K, value: PlaceDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const dropAt = (event: PointerEvent<SVGSVGElement>) => {
    const box = plan.current?.getBoundingClientRect();
    if (!box) return;
    const within = (fraction: number) => Math.round(Math.min(96, Math.max(4, fraction * 100)));
    setDraft((current) => ({
      ...current,
      x: within((event.clientX - box.left) / box.width),
      y: within((event.clientY - box.top) / box.height),
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    const name = draft.name.trim();
    if (name.length < 2) found.name = 'Give it a name people would search for.';
    else if (onThisFloor.some((other) => other.name.toLowerCase() === name.toLowerCase()))
      found.name = `Something on ${draft.level} already has that name.`;

    setErrors(found);
    if (found.name) {
      document.getElementById('place-name')?.focus();
      return;
    }

    onSave({ ...draft, name, detail: draft.detail.trim(), hours: draft.hours.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Pathfinder</p>
            <h2 className="dx-h4">{editingId ? 'Edit this place' : 'Put something on the map'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              Anything you add here becomes searchable, routable and part of everyone's walk.
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
            <label htmlFor="place-name" className="dx-eyebrow mb-1.5 block">
              Name
            </label>
            <input
              id="place-name"
              type="text"
              value={draft.name}
              data-autofocus
              maxLength={40}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'place-name-error' : undefined}
              placeholder="Quiet booth by the window"
              className={cn('dx-field', errors.name && 'border-danger')}
            />
            {errors.name && (
              <p id="place-name-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="place-kind" className="dx-eyebrow mb-1.5 block">
                What it is
              </label>
              <select
                id="place-kind"
                value={draft.kind}
                onChange={(event) => set('kind', event.target.value as PlaceKind)}
                className="dx-field"
              >
                {FINDABLE.map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABEL[kind]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="place-level" className="dx-eyebrow mb-1.5 block">
                Floor
              </label>
              <select
                id="place-level"
                value={draft.level}
                onChange={(event) => set('level', event.target.value)}
                className="dx-field"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="dx-eyebrow mb-1.5">Where it sits — tap the plan</p>
            <svg
              ref={plan}
              viewBox={`0 0 100 ${HEIGHT}`}
              onPointerDown={dropAt}
              className="w-full cursor-crosshair touch-none rounded-lg border border-line bg-nt-50"
              role="img"
              aria-label={`Plan of ${draft.level}. The new place sits at ${draft.x} across and ${draft.y} down.`}
            >
              <rect
                x={3}
                y={3}
                width={94}
                height={HEIGHT - 6}
                rx={2.5}
                className="fill-nt-0 stroke-line"
                strokeWidth={0.4}
              />
              {SPINE_EDGES.map(([from, to]) => {
                const a = spineAt(from);
                const b = spineAt(to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.x}
                    y1={a.y * PLAN_RATIO}
                    x2={b.x}
                    y2={b.y * PLAN_RATIO}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    className="stroke-nt-100"
                  />
                );
              })}
              {onThisFloor.map((place) => (
                <circle
                  key={place.id}
                  cx={place.x}
                  cy={place.y * PLAN_RATIO}
                  r={1.5}
                  className="fill-nt-300"
                >
                  <title>{place.name}</title>
                </circle>
              ))}
              <circle
                cx={draft.x}
                cy={draft.y * PLAN_RATIO}
                r={2.8}
                className="fill-brand-600"
              />
              <circle cx={draft.x} cy={draft.y * PLAN_RATIO} r={1} className="fill-nt-0" />
            </svg>
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-line px-4 py-3">
            <input
              type="checkbox"
              checked={draft.stepFree}
              onChange={(event) => set('stepFree', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-600"
            />
            <span>
              <span className="block text-[0.8125rem] text-ink">You can reach it without steps</span>
              <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
                Leave this off and Pathfinder will keep it out of step-free routes instead of
                pretending it works.
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="place-detail" className="dx-eyebrow mb-1.5 block">
                Anything worth knowing
              </label>
              <textarea
                id="place-detail"
                value={draft.detail}
                rows={2}
                maxLength={180}
                onChange={(event) => set('detail', event.target.value)}
                placeholder="What is there, and anything that catches people out."
                className="dx-field resize-none"
              />
            </div>

            <div>
              <label htmlFor="place-hours" className="dx-eyebrow mb-1.5 block">
                Open (optional)
              </label>
              <input
                id="place-hours"
                type="text"
                value={draft.hours}
                maxLength={24}
                onChange={(event) => set('hours', event.target.value)}
                placeholder="07:00 – 16:00"
                className="dx-field"
              />
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save the place' : 'Add it to the map'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
