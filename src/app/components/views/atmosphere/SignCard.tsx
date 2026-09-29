import { useState } from 'react';
import type { FormEvent } from 'react';
import { DoorClosed } from 'lucide-react';
import { cn } from '../../ui/utils';
import { SIGN_LABEL } from '../../../lib/climate';
import type { Meeting, SignState, Space, Zone } from '../../../lib/data';
import { SIGNS, SIGN_DOT, SIGN_TONE } from './comfort';

const PRESETS = ['Back in five', 'On a call', 'Out for lunch', 'Interviewing — please knock'];

interface SignCardProps {
  space: Space;
  zone: Zone;
  happening?: Meeting;
  locked: boolean;
  onPatch: (patch: Partial<Zone>) => void;
}

export function SignCard({ space, zone, happening, locked, onPatch }: SignCardProps) {
  const [note, setNote] = useState(zone.signNote ?? '');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onPatch({ signNote: note.trim() || undefined });
  };

  return (
    <section aria-labelledby="sign-heading" className="dx-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
        <DoorClosed size={14} aria-hidden="true" className="text-ink-subtle" />
        <h3 id="sign-heading" className="dx-eyebrow">
          The sign on the door
        </h3>
      </div>

      <div className="px-5 py-5">
        <div className="mb-5 rounded-lg bg-nt-900 px-5 py-4 text-nt-0">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-medium">{space.name}</p>
              <p className="text-[0.6875rem] text-nt-300">{space.level}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-nt-0/10 px-2.5 py-1 text-[0.6875rem]">
              <span className={cn('h-1.5 w-1.5 rounded-full', SIGN_DOT[zone.sign])} />
              {SIGN_LABEL[zone.sign]}
            </span>
          </div>

          <p className="text-[0.8125rem] text-nt-200">
            {zone.signNote ??
              (happening
                ? `${happening.title} · until ${happening.end}`
                : 'Nothing booked — come in.')}
          </p>
        </div>

        <fieldset disabled={locked} className="mb-4">
          <legend className="dx-eyebrow mb-2">What it should say</legend>
          <div className="flex flex-wrap gap-1.5">
            {SIGNS.map((state) => {
              const on = zone.sign === state;
              return (
                <button
                  key={state}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPatch({ sign: state as SignState })}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] transition-all duration-[180ms]',
                    on ? SIGN_TONE[state] : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                    locked && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', SIGN_DOT[state])} />
                  {SIGN_LABEL[state]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <form onSubmit={submit}>
          <label htmlFor="sign-note" className="dx-eyebrow mb-1.5 block">
            A line underneath
          </label>
          <div className="flex gap-2">
            <input
              id="sign-note"
              type="text"
              value={note}
              maxLength={48}
              disabled={locked}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Leave it empty to show what is booked"
              className="dx-field flex-1 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button type="submit" disabled={locked} className="dx-btn-secondary shrink-0 disabled:opacity-50">
              Set
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={locked}
                onClick={() => {
                  setNote(preset);
                  onPatch({ signNote: preset });
                }}
                className="rounded-full border border-line px-2.5 py-1 text-[0.6875rem] text-ink-muted transition-all duration-[180ms] hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
