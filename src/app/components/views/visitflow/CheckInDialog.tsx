import { useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { useCollection } from '../../../lib/store';
import { badges as badgesCol } from '../../../lib/data';
import type { Visit } from '../../../lib/data';
import { formatDay, initials } from './visits';

interface CheckInDialogProps {
  visit: Visit;
  onClose: () => void;
  onConfirm: (visit: Visit, badgeNumber: string) => void;
}

export function CheckInDialog({ visit, onClose, onConfirm }: CheckInDialogProps) {
  const titleId = useId();
  const badges = useCollection(badgesCol);
  const available = useMemo(() => badges.filter((badge) => !badge.visitId), [badges]);
  const [picked, setPicked] = useState('');

  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="dx-card relative flex w-full max-w-sm flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-[0.8125rem] font-medium text-brand-700"
            >
              {initials(visit.guest)}
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="dx-h4 truncate">
                {visit.guest}
              </h2>
              <p className="truncate text-[0.6875rem] text-ink-muted">
                {visit.company} · {formatDay(visit.date)} at {visit.time}
              </p>
            </div>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="dx-eyebrow mb-2.5">Hand them a badge</p>

          {available.length === 0 ? (
            <p className="rounded-md bg-warning-bg px-3.5 py-3 text-[0.8125rem] text-ink">
              Every badge is out. Check one back in first, or admit them without one.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {available.map((badge) => {
                const active = picked === badge.number;
                return (
                  <button
                    key={badge.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPicked(active ? '' : badge.number)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-[0.8125rem] tabular-nums transition-all duration-[180ms]',
                      active
                        ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                        : 'border-line bg-nt-0 text-ink hover:border-line-strong hover:bg-nt-50',
                    )}
                  >
                    {badge.number}
                  </button>
                );
              })}
            </div>
          )}

          {visit.notes && (
            <p className="mt-4 rounded-md bg-nt-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-ink-muted">
              {visit.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="dx-btn-secondary flex-1">
            Not yet
          </button>
          <button
            type="button"
            onClick={() => onConfirm(visit, picked)}
            className="dx-btn-primary flex-1"
          >
            {picked ? `Check in · ${picked}` : 'Check in'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
