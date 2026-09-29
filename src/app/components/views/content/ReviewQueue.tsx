import { useState } from 'react';
import { Check, CornerUpLeft, MonitorPlay } from 'lucide-react';
import { EmptyState } from '../../shell/EmptyState';
import { timeAgo } from '../../../lib/format';
import { SurfacePreview } from './SurfacePreview';
import { SURFACES, kindLabel } from './library';
import type { Entry } from '../../../lib/data';

interface ReviewQueueProps {
  waiting: Entry[];
  onApprove: (entry: Entry) => void;
  onSendBack: (entry: Entry, note: string) => void;
  onOpen: (entry: Entry) => void;
  onBrowse: () => void;
}

export function ReviewQueue({
  waiting,
  onApprove,
  onSendBack,
  onOpen,
  onBrowse,
}: ReviewQueueProps) {
  const [returning, setReturning] = useState<string | null>(null);
  const [note, setNote] = useState('');

  if (waiting.length === 0) {
    return (
      <EmptyState
        icon={Check}
        title="Nothing is waiting on your read."
        actionLabel="Browse the library"
        onAction={onBrowse}
      />
    );
  }

  return (
    <ul className="space-y-3 p-4">
      {waiting.map((entry) => (
        <li key={entry.id} className="rounded-sm border border-line bg-nt-0 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
            <div className="min-w-0">
              <p className="dx-eyebrow mb-1.5">
                {kindLabel(entry.kind)} · {entry.owner} · {timeAgo(entry.updatedAt)}
              </p>
              <button
                type="button"
                onClick={() => onOpen(entry)}
                className="text-left text-body-lg font-medium leading-snug text-ink transition-colors duration-[180ms] hover:text-brand-700"
              >
                {entry.title}
              </button>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">{entry.body}</p>

              <p className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                <MonitorPlay size={12} aria-hidden="true" />
                Saying yes puts it on{' '}
                {SURFACES.filter((surface) => entry.surfaces.includes(surface.id))
                  .map((surface) => surface.product)
                  .join(' and ')}
                .
              </p>

              {returning === entry.id ? (
                <div className="mt-3 space-y-2">
                  <label htmlFor={`send-back-${entry.id}`} className="dx-eyebrow block">
                    What needs doing
                  </label>
                  <textarea
                    id={`send-back-${entry.id}`}
                    value={note}
                    rows={2}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Names are spelled two ways — pick one."
                    className="dx-field resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={note.trim().length < 4}
                      onClick={() => {
                        onSendBack(entry, note.trim());
                        setReturning(null);
                        setNote('');
                      }}
                      className="dx-btn-primary h-8 px-3 text-[0.75rem] disabled:opacity-50"
                    >
                      Send it back
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturning(null)}
                      className="dx-btn-secondary h-8 px-3 text-[0.75rem]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(entry)}
                    className="dx-btn-primary h-9 px-3.5 text-[0.8125rem]"
                  >
                    <Check size={14} aria-hidden="true" />
                    Publish it
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReturning(entry.id);
                      setNote('');
                    }}
                    className="dx-btn-secondary h-9 px-3.5 text-[0.8125rem]"
                  >
                    <CornerUpLeft size={14} aria-hidden="true" />
                    Send back
                  </button>
                </div>
              )}
            </div>

            <div className="lg:border-l lg:border-line lg:pl-4">
              <p className="dx-eyebrow mb-2">How it will look</p>
              {entry.surfaces.includes('livecanvas') ? (
                <SurfacePreview entry={entry} surface="livecanvas" />
              ) : (
                <SurfacePreview entry={entry} surface={entry.surfaces[0] ?? 'today'} />
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
