import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { TRIGGER_LABEL, describeRule } from '../../../lib/climate';
import { KIND_NAME } from '../../../lib/agenda';
import type { MeetingKind, Rule, RuleTrigger, Scene, Space } from '../../../lib/data';

export interface RuleDraft {
  name: string;
  trigger: RuleTrigger;
  sceneId: string;
  spaceId: string;
  lead: number;
  kind: string;
  active: boolean;
}

const TRIGGERS: RuleTrigger[] = [
  'meeting-starts',
  'meeting-ends',
  'day-starts',
  'day-ends',
  'room-empty',
  'co2-high',
];

const KINDS: MeetingKind[] = [
  'meeting',
  'focus',
  'workshop',
  'one-to-one',
  'interview',
  'gathering',
];

const LEADS = [0, 5, 10, 15, 20, 30, 45, 60, 90];

export const blankRule = (sceneId: string): RuleDraft => ({
  name: '',
  trigger: 'meeting-starts',
  sceneId,
  spaceId: '',
  lead: 15,
  kind: 'any',
  active: true,
});

export const draftFromRule = (rule: Rule): RuleDraft => ({
  name: rule.name,
  trigger: rule.trigger,
  sceneId: rule.sceneId,
  spaceId: rule.spaceId ?? '',
  lead: rule.lead,
  kind: rule.kind ?? 'any',
  active: rule.active,
});

interface Errors {
  name?: string;
  scene?: string;
}

const FOCUS_ORDER: Array<keyof Errors> = ['name', 'scene'];

interface RuleDialogProps {
  initial: RuleDraft;
  editingId?: string;
  scenes: Scene[];
  spaces: Space[];
  onClose: () => void;
  onSave: (draft: RuleDraft) => void;
}

export function RuleDialog({
  initial,
  editingId,
  scenes,
  spaces,
  onClose,
  onSave,
}: RuleDialogProps) {
  const [draft, setDraft] = useState<RuleDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const aboutMeetings = draft.trigger === 'meeting-starts' || draft.trigger === 'meeting-ends';
  const leads = draft.trigger === 'meeting-starts' || draft.trigger === 'day-starts';

  const sentence = describeRule(
    {
      id: '',
      createdAt: '',
      updatedAt: '',
      name: draft.name,
      trigger: draft.trigger,
      sceneId: draft.sceneId,
      spaceId: draft.spaceId === '' ? undefined : draft.spaceId,
      lead: leads ? draft.lead : 0,
      owner: '',
      active: draft.active,
      runs: 0,
    },
    spaces,
    scenes,
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.name.trim().length < 3) found.name = 'Give the rule a name you will recognise later.';
    if (!scenes.some((scene) => scene.id === draft.sceneId))
      found.scene = 'Pick the scene it should apply.';

    setErrors(found);

    const first = FOCUS_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(`rule-${first}`)?.focus();
      return;
    }

    onSave({ ...draft, name: draft.name.trim(), lead: leads ? draft.lead : 0 });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Atmosphere</p>
            <h2 className="dx-h4">{editingId ? 'Edit this rule' : 'Let the room do it'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              A rule runs a scene on its own, so nobody walks into a cold room.
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
            <label htmlFor="rule-name" className="dx-eyebrow mb-1.5 block">
              Name
            </label>
            <input
              id="rule-name"
              type="text"
              value={draft.name}
              data-autofocus
              maxLength={48}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'rule-name-error' : undefined}
              placeholder="Cool the boardroom before the client arrives"
              className={cn('dx-field', errors.name && 'border-danger')}
            />
            {errors.name && (
              <p id="rule-name-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rule-trigger" className="dx-eyebrow mb-1.5 block">
                When
              </label>
              <select
                id="rule-trigger"
                value={draft.trigger}
                onChange={(event) => set('trigger', event.target.value as RuleTrigger)}
                className="dx-field"
              >
                {TRIGGERS.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {TRIGGER_LABEL[trigger]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rule-scene" className="dx-eyebrow mb-1.5 block">
                Run this scene
              </label>
              <select
                id="rule-scene"
                value={draft.sceneId}
                onChange={(event) => set('sceneId', event.target.value)}
                aria-invalid={Boolean(errors.scene)}
                aria-describedby={errors.scene ? 'rule-scene-error' : undefined}
                className={cn('dx-field', errors.scene && 'border-danger')}
              >
                <option value="">Pick one</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.name}
                  </option>
                ))}
              </select>
              {errors.scene && (
                <p id="rule-scene-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.scene}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="rule-space" className="dx-eyebrow mb-1.5 block">
                Where
              </label>
              <select
                id="rule-space"
                value={draft.spaceId}
                onChange={(event) => set('spaceId', event.target.value)}
                className="dx-field"
              >
                <option value="">Wherever I am</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} · {space.level}
                  </option>
                ))}
              </select>
            </div>

            {leads && (
              <div>
                <label htmlFor="rule-lead" className="dx-eyebrow mb-1.5 block">
                  How far ahead
                </label>
                <select
                  id="rule-lead"
                  value={draft.lead}
                  onChange={(event) => set('lead', Number(event.target.value))}
                  className="dx-field"
                >
                  {LEADS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes === 0 ? 'Right on time' : `${minutes} minutes before`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {aboutMeetings && (
              <div className={leads ? 'sm:col-span-2' : undefined}>
                <label htmlFor="rule-kind" className="dx-eyebrow mb-1.5 block">
                  Only for
                </label>
                <select
                  id="rule-kind"
                  value={draft.kind}
                  onChange={(event) => set('kind', event.target.value)}
                  className="dx-field"
                >
                  <option value="any">Anything in my calendar</option>
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {KIND_NAME[kind]}
                    </option>
                  ))}
                </select>
              </div>
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
              <span className="block text-[0.8125rem] text-ink">Turn it on now</span>
              <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
                You can switch it off at any time without losing it.
              </span>
            </span>
          </label>

          <div className="rounded-lg border border-line bg-nt-50 px-4 py-3.5">
            <p className="dx-eyebrow mb-1.5">In plain words</p>
            <p className="text-[0.875rem] text-ink">{sentence}</p>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save the rule' : 'Create the rule'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
