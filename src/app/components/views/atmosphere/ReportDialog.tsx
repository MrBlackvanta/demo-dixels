import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import type { TicketPriority, Space, Zone } from '../../../lib/data';
import { people } from './comfort';

export interface Symptom {
  id: string;
  label: string;
  category: string;
  priority: TicketPriority;
  hint: string;
}

export const SYMPTOMS: Symptom[] = [
  { id: 'cold', label: 'It is too cold in here', category: 'Heating and cooling', priority: 'high', hint: 'The room sits well under what the panel asks for.' },
  { id: 'hot', label: 'It is too warm in here', category: 'Heating and cooling', priority: 'high', hint: 'The room will not come down to the setpoint.' },
  { id: 'stuffy', label: 'The air is stuffy', category: 'Ventilation', priority: 'medium', hint: 'Fresh air is not reaching the room.' },
  { id: 'noise', label: 'Something is noisy', category: 'Ventilation', priority: 'medium', hint: 'A rattle, a whine or a duct you can hear over a call.' },
  { id: 'lights', label: 'The lights are wrong', category: 'Lighting', priority: 'low', hint: 'Flickering, dead, or refusing to dim.' },
  { id: 'blinds', label: 'The blinds are stuck', category: 'Lighting', priority: 'low', hint: 'They will not move, or only move one way.' },
];

interface ReportDialogProps {
  space: Space;
  zone: Zone;
  alreadySaid: number;
  suggested: string;
  onClose: () => void;
  onRaise: (symptom: Symptom, detail: string) => void;
}

export function ReportDialog({
  space,
  zone,
  alreadySaid,
  suggested,
  onClose,
  onRaise,
}: ReportDialogProps) {
  const [chosen, setChosen] = useState(suggested);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string>();

  const symptom = SYMPTOMS.find((row) => row.id === chosen) ?? SYMPTOMS[0];

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (detail.trim().length < 8) {
      setError('Tell the team what they will find when they get here.');
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
            <p className="dx-eyebrow mb-1.5">Atmosphere · {space.name}</p>
            <h2 className="dx-h4">Get somebody to look at it</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              This raises a real ticket in Resolve, with the readings attached.
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
            <legend className="dx-eyebrow mb-2">What is wrong</legend>
            <div className="space-y-1.5">
              {SYMPTOMS.map((row) => (
                <label
                  key={row.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-2.5 transition-all duration-[180ms]',
                    chosen === row.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-line hover:border-brand-300',
                  )}
                >
                  <input
                    type="radio"
                    name="symptom"
                    value={row.id}
                    checked={chosen === row.id}
                    onChange={() => setChosen(row.id)}
                    className="mt-0.5 h-4 w-4 border-line-strong accent-brand-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] text-ink">{row.label}</span>
                    <span className="mt-0.5 block text-[0.75rem] text-ink-muted">{row.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="report-detail" className="dx-eyebrow mb-1.5 block">
              What is happening
            </label>
            <textarea
              id="report-detail"
              rows={3}
              value={detail}
              data-autofocus
              maxLength={240}
              onChange={(event) => setDetail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'report-detail-error' : undefined}
              placeholder="It has been like this since Monday and nobody wants to sit here."
              className={cn('dx-field min-h-[5rem] resize-y', error && 'border-danger')}
            />
            {error && (
              <p id="report-detail-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-line bg-nt-50 px-4 py-3.5">
            <p className="dx-eyebrow mb-2">What gets sent with it</p>
            <ul className="space-y-1 text-[0.8125rem] text-ink-muted">
              <li>
                {space.name}, {space.level} — {zone.temp.toFixed(1)}° against a setpoint of{' '}
                {zone.target.toFixed(1)}°
              </li>
              <li>
                {zone.co2} ppm, {zone.humidity}% humidity, {zone.noise} dB
              </li>
              <li>
                Goes to the Workplace team as a {symptom.priority} priority {symptom.category.toLowerCase()} job
              </li>
              {alreadySaid > 0 && (
                <li className="text-warning">
                  {people(alreadySaid)} already flagged this room in the last eight hours
                </li>
              )}
            </ul>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            Raise it with Workplace
          </button>
        </footer>
      </form>
    </Modal>
  );
}
