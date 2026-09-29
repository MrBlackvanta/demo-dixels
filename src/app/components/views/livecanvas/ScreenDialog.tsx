import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { LEVELS } from '../../../lib/wayfinding';
import type { Channel, Screen, ScreenShape } from '../../../lib/data';

export interface ScreenDraft {
  name: string;
  level: string;
  shape: ScreenShape;
  channelId: string;
  brightness: number;
  placeId: string;
}

export const blankScreen = (channelId: string): ScreenDraft => ({
  name: '',
  level: 'Level 1',
  shape: 'landscape',
  channelId,
  brightness: 80,
  placeId: '',
});

export const draftFromScreen = (screen: Screen): ScreenDraft => ({
  name: screen.name,
  level: screen.level,
  shape: screen.shape,
  channelId: screen.channelId,
  brightness: screen.brightness,
  placeId: screen.placeId ?? '',
});

interface Errors {
  name?: string;
}

interface ScreenDialogProps {
  initial: ScreenDraft;
  editingId?: string;
  channels: Channel[];
  places: Array<{ id: string; name: string; level: string }>;
  onClose: () => void;
  onSave: (draft: ScreenDraft) => void;
}

export function ScreenDialog({
  initial,
  editingId,
  channels,
  places,
  onClose,
  onSave,
}: ScreenDialogProps) {
  const [draft, setDraft] = useState<ScreenDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ScreenDraft>(key: K, value: ScreenDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const onFloor = places
    .filter((place) => place.level === draft.level)
    .sort((a, b) => a.name.localeCompare(b.name));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.name.trim().length < 3)
      found.name = 'Name it the way someone standing in front of it would.';

    setErrors(found);
    if (found.name) {
      document.getElementById('screen-name')?.focus();
      return;
    }

    onSave({ ...draft, name: draft.name.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-lg sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">LiveCanvas</p>
            <h2 className="dx-h4">{editingId ? 'Edit this screen' : 'Add a screen'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              It starts playing its channel the moment it answers.
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
            <label htmlFor="screen-name" className="dx-eyebrow mb-1.5 block">
              What it is called
            </label>
            <input
              id="screen-name"
              type="text"
              value={draft.name}
              data-autofocus
              maxLength={48}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'screen-name-error' : undefined}
              placeholder="Level 3 pantry board"
              className={cn('dx-field', errors.name && 'border-danger')}
            />
            {errors.name && (
              <p id="screen-name-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="screen-level" className="dx-eyebrow mb-1.5 block">
                Floor
              </label>
              <select
                id="screen-level"
                value={draft.level}
                onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value, placeId: '' }))}
                className="dx-field"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="screen-place" className="dx-eyebrow mb-1.5 block">
                Nearest place
              </label>
              <select
                id="screen-place"
                value={draft.placeId}
                onChange={(event) => set('placeId', event.target.value)}
                className="dx-field"
              >
                <option value="">Not pinned yet</option>
                {onFloor.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="dx-eyebrow mb-1.5">Hung how</p>
              <div className="flex gap-1.5">
                {(['landscape', 'portrait'] as ScreenShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    aria-pressed={draft.shape === shape}
                    onClick={() => set('shape', shape)}
                    className={cn(
                      'flex-1 rounded-sm border px-3 py-2 text-[0.8125rem] capitalize transition-colors duration-[180ms]',
                      draft.shape === shape
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                        : 'border-line text-ink-muted hover:text-ink',
                    )}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="screen-channel" className="dx-eyebrow mb-1.5 block">
                What it plays
              </label>
              <select
                id="screen-channel"
                value={draft.channelId}
                onChange={(event) => set('channelId', event.target.value)}
                className="dx-field"
              >
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="screen-new-brightness"
              className="mb-1.5 flex items-center justify-between"
            >
              <span className="dx-eyebrow">Brightness</span>
              <span className="text-[0.75rem] font-medium text-ink">{draft.brightness}%</span>
            </label>
            <input
              id="screen-new-brightness"
              type="range"
              min={0}
              max={100}
              step={5}
              value={draft.brightness}
              onChange={(event) => set('brightness', Number(event.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line bg-nt-50 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save it' : 'Add the screen'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
