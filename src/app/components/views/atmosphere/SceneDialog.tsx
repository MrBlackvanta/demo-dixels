import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { money } from '../../../lib/format';
import {
  CEILING_TARGET,
  FAN_LABEL,
  FLOOR_TARGET,
  MODE_LABEL,
  SIGN_LABEL,
  STEP,
  dailyCost,
  sceneChanges,
  warmthLabel,
} from '../../../lib/climate';
import type { HvacMode, Scene, SignState, Space, Zone } from '../../../lib/data';
import { GLYPHS, MODES, SIGNS, glyphIcon } from './comfort';

export interface SceneDraft {
  name: string;
  summary: string;
  glyph: string;
  target: number;
  mode: HvacMode;
  fan: number;
  lights: number;
  warmth: number;
  blinds: number;
  sign: SignState;
  shared: boolean;
}

export const blankScene = (): SceneDraft => ({
  name: '',
  summary: '',
  glyph: 'focus',
  target: 22,
  mode: 'auto',
  fan: 1,
  lights: 70,
  warmth: 4000,
  blinds: 60,
  sign: 'available',
  shared: false,
});

export const draftFrom = (scene: Scene): SceneDraft => ({
  name: scene.name,
  summary: scene.summary,
  glyph: scene.glyph,
  target: scene.target,
  mode: scene.mode,
  fan: scene.fan,
  lights: scene.lights,
  warmth: scene.warmth,
  blinds: scene.blinds,
  sign: scene.sign,
  shared: scene.shared,
});

interface Errors {
  name?: string;
}

const NAME_MIN = 2;

interface SceneDialogProps {
  initial: SceneDraft;
  editingId?: string;
  taken: string[];
  zone?: Zone;
  space?: Space;
  onClose: () => void;
  onSave: (draft: SceneDraft) => void;
}

export function SceneDialog({
  initial,
  editingId,
  taken,
  zone,
  space,
  onClose,
  onSave,
}: SceneDialogProps) {
  const [draft, setDraft] = useState<SceneDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof SceneDraft>(key: K, value: SceneDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const changes = useMemo(() => {
    if (!zone) return [];
    return sceneChanges(zone, { ...draft, id: '', createdAt: '', updatedAt: '', owner: '', builtIn: false, uses: 0 } as Scene);
  }, [zone, draft]);

  const cost = space === undefined ? undefined : Math.round(dailyCost(draft.target, space));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    const name = draft.name.trim();
    if (name.length < NAME_MIN) found.name = `Give it a name of at least ${NAME_MIN} characters.`;
    else if (taken.some((other) => other.toLowerCase() === name.toLowerCase()))
      found.name = 'You already have a scene with that name.';

    setErrors(found);
    if (found.name) {
      document.getElementById('scene-name')?.focus();
      return;
    }

    onSave({ ...draft, name, summary: draft.summary.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Atmosphere</p>
            <h2 className="dx-h4">{editingId ? 'Edit this scene' : 'Make a scene'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              One press sets the temperature, the air, the light and the sign together.
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
            <label htmlFor="scene-name" className="dx-eyebrow mb-1.5 block">
              Name
            </label>
            <input
              id="scene-name"
              type="text"
              value={draft.name}
              data-autofocus
              maxLength={32}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'scene-name-error' : undefined}
              placeholder="Deep work, Client visit, Late finish"
              className={cn('dx-field', errors.name && 'border-danger')}
            />
            {errors.name && (
              <p id="scene-name-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="scene-summary" className="dx-eyebrow mb-1.5 block">
              What it is for
            </label>
            <input
              id="scene-summary"
              type="text"
              value={draft.summary}
              maxLength={80}
              onChange={(event) => set('summary', event.target.value)}
              placeholder="A line so other people know when to use it"
              className="dx-field"
            />
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-2">Icon</legend>
            <div className="flex flex-wrap gap-1.5">
              {GLYPHS.map((glyph) => {
                const Icon = glyphIcon(glyph);
                const on = draft.glyph === glyph;
                return (
                  <button
                    key={glyph}
                    type="button"
                    aria-pressed={on}
                    aria-label={glyph}
                    onClick={() => set('glyph', glyph)}
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-md border transition-all duration-[180ms]',
                      on
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                    )}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="scene-target" className="mb-1.5 flex items-baseline justify-between">
                <span className="dx-eyebrow">Temperature</span>
                <span className="text-[0.75rem] tabular-nums text-ink-muted">
                  {draft.target.toFixed(1)}°
                </span>
              </label>
              <input
                id="scene-target"
                type="range"
                min={FLOOR_TARGET}
                max={CEILING_TARGET}
                step={STEP}
                value={draft.target}
                onChange={(event) => set('target', Number(event.target.value))}
                className="h-1.5 w-full appearance-none rounded-full bg-nt-100 accent-brand-600"
              />
            </div>

            <div>
              <label htmlFor="scene-mode" className="dx-eyebrow mb-1.5 block">
                Air
              </label>
              <select
                id="scene-mode"
                value={draft.mode}
                onChange={(event) => set('mode', event.target.value as HvacMode)}
                className="dx-field"
              >
                {MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {MODE_LABEL[mode]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scene-fan" className="dx-eyebrow mb-1.5 block">
                Fan
              </label>
              <select
                id="scene-fan"
                value={draft.fan}
                onChange={(event) => set('fan', Number(event.target.value))}
                className="dx-field"
              >
                {FAN_LABEL.map((label, speed) => (
                  <option key={label} value={speed}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scene-sign" className="dx-eyebrow mb-1.5 block">
                Sign on the door
              </label>
              <select
                id="scene-sign"
                value={draft.sign}
                onChange={(event) => set('sign', event.target.value as SignState)}
                className="dx-field"
              >
                {SIGNS.map((state) => (
                  <option key={state} value={state}>
                    {SIGN_LABEL[state]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="scene-lights" className="mb-1.5 flex items-baseline justify-between">
                <span className="dx-eyebrow">Lights</span>
                <span className="text-[0.75rem] tabular-nums text-ink-muted">{draft.lights}%</span>
              </label>
              <input
                id="scene-lights"
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft.lights}
                onChange={(event) => set('lights', Number(event.target.value))}
                className="h-1.5 w-full appearance-none rounded-full bg-nt-100 accent-brand-600"
              />
            </div>

            <div>
              <label htmlFor="scene-warmth" className="mb-1.5 flex items-baseline justify-between">
                <span className="dx-eyebrow">Light warmth</span>
                <span className="text-[0.75rem] tabular-nums text-ink-muted">
                  {warmthLabel(draft.warmth)}
                </span>
              </label>
              <input
                id="scene-warmth"
                type="range"
                min={2200}
                max={6000}
                step={100}
                value={draft.warmth}
                onChange={(event) => set('warmth', Number(event.target.value))}
                className="h-1.5 w-full appearance-none rounded-full bg-nt-100 accent-brand-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="scene-blinds" className="mb-1.5 flex items-baseline justify-between">
                <span className="dx-eyebrow">Blinds</span>
                <span className="text-[0.75rem] tabular-nums text-ink-muted">
                  {draft.blinds === 0 ? 'Shut' : `${draft.blinds}% open`}
                </span>
              </label>
              <input
                id="scene-blinds"
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft.blinds}
                onChange={(event) => set('blinds', Number(event.target.value))}
                className="h-1.5 w-full appearance-none rounded-full bg-nt-100 accent-brand-600"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-line px-4 py-3">
            <input
              type="checkbox"
              checked={draft.shared}
              onChange={(event) => set('shared', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-600"
            />
            <span>
              <span className="block text-[0.8125rem] text-ink">Let anyone use it</span>
              <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
                Shared scenes show up for everyone who can set that room.
              </span>
            </span>
          </label>

          {space && zone && (
            <div className="rounded-lg border border-line bg-nt-50 px-4 py-3.5">
              <p className="dx-eyebrow mb-2">If you ran it in {space.name} now</p>
              {changes.length === 0 ? (
                <p className="text-[0.8125rem] text-ink-muted">
                  Nothing would move — the room is already set like this.
                </p>
              ) : (
                <ul className="space-y-1">
                  {changes.map((change) => (
                    <li key={change.label} className="text-[0.8125rem] text-ink">
                      {change.label}{' '}
                      <span className="text-ink-muted">
                        {change.from} → {change.to}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {cost !== undefined && (
                <p className="mt-2 text-[0.75rem] text-ink-muted">
                  Holding it there costs about {money(cost)} a day.
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save the scene' : 'Create the scene'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
