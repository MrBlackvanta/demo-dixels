import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { KIND_LABEL } from '../../../lib/wayfinding';
import type { Place, TicketPriority, TicketTeam } from '../../../lib/data';

export interface Symptom {
  id: string;
  label: string;
  hint: string;
  category: string;
  team: TicketTeam;
  priority: TicketPriority;
}

export const SYMPTOMS: Symptom[] = [
  {
    id: 'signage',
    label: 'The signs send you the wrong way',
    hint: 'Missing, wrong, or pointing at something that moved.',
    category: 'Wayfinding',
    team: 'Workplace',
    priority: 'low',
  },
  {
    id: 'blocked',
    label: 'The way through is blocked',
    hint: 'Boxes, furniture, or works nobody told us about.',
    category: 'Wayfinding',
    team: 'Workplace',
    priority: 'high',
  },
  {
    id: 'locked',
    label: 'The door will not open with my badge',
    hint: 'It should let me in and it does not.',
    category: 'Access control',
    team: 'Security',
    priority: 'high',
  },
  {
    id: 'stepfree',
    label: 'The step-free route does not work',
    hint: 'A ramp, lift or door that is meant to be level and is not.',
    category: 'Accessibility',
    team: 'Workplace',
    priority: 'urgent',
  },
  {
    id: 'wrong',
    label: 'This is not where the map says',
    hint: 'The pin is on the wrong spot, or the name is out of date.',
    category: 'Wayfinding',
    team: 'Workplace',
    priority: 'low',
  },
];

interface ReportDialogProps {
  place: Place;
  suggested: string;
  onClose: () => void;
  onRaise: (symptom: Symptom, detail: string) => void;
}

export function ReportDialog({ place, suggested, onClose, onRaise }: ReportDialogProps) {
  const [picked, setPicked] = useState(suggested);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string>();

  const symptom = SYMPTOMS.find((entry) => entry.id === picked) ?? SYMPTOMS[0];

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (detail.trim().length < 10) {
      setError('A sentence is enough, but it has to say what you saw.');
      document.getElementById('report-detail')?.focus();
      return;
    }

    setError(undefined);
    onRaise(symptom, detail.trim());
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-lg sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Pathfinder</p>
            <h2 className="dx-h4">Something is wrong here</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {place.name} · {KIND_LABEL[place.kind]} · {place.level}
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
          <fieldset>
            <legend className="dx-eyebrow mb-2">What is it</legend>
            <div className="space-y-2">
              {SYMPTOMS.map((entry) => (
                <label
                  key={entry.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg border px-4 py-3 transition-colors duration-[160ms]',
                    picked === entry.id ? 'border-brand-500 bg-brand-50/60' : 'border-line',
                  )}
                >
                  <input
                    type="radio"
                    name="symptom"
                    value={entry.id}
                    checked={picked === entry.id}
                    onChange={() => setPicked(entry.id)}
                    className="mt-0.5 h-4 w-4 border-line-strong accent-brand-600"
                  />
                  <span>
                    <span className="block text-[0.8125rem] text-ink">{entry.label}</span>
                    <span className="mt-0.5 block text-[0.75rem] text-ink-muted">{entry.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="report-detail" className="dx-eyebrow mb-1.5 block">
              What did you see
            </label>
            <textarea
              id="report-detail"
              value={detail}
              data-autofocus
              rows={3}
              maxLength={240}
              onChange={(event) => setDetail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'report-detail-error' : undefined}
              placeholder="Where exactly, and what stopped you."
              className={cn('dx-field resize-none', error && 'border-danger')}
            />
            {error && (
              <p id="report-detail-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {error}
              </p>
            )}
          </div>

          <p className="rounded-lg border border-line bg-nt-50 px-4 py-3 text-[0.75rem] text-ink-muted">
            This goes to the {symptom.team} team in Resolve as a {symptom.priority} priority{' '}
            {symptom.category.toLowerCase()} request, with the floor and the exact spot attached.
          </p>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            Send it
          </button>
        </footer>
      </form>
    </Modal>
  );
}
