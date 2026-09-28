import { useState } from 'react';
import {
  Check,
  CornerDownRight,
  HandCoins,
  PackageCheck,
  Send,
  Trash2,
  UserRoundPlus,
  X,
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { Rating } from '../../shell/Rating';
import { formatDay, initials, money, timeAgo } from '../../../lib/format';
import { awaits, serviceById, totalOf } from '../../../lib/catalogue';
import type { ServiceRequest } from '../../../lib/data';
import { ApprovalChain } from './ApprovalChain';
import { StageChip } from './StageChip';

type Mode = 'note' | 'approve' | 'decline' | 'ready' | 'cancel';

interface RequestSheetProps {
  request: ServiceRequest;
  me: string;
  onClose: () => void;
  onNote: (request: ServiceRequest, body: string) => void;
  onApprove?: (request: ServiceRequest, note: string) => void;
  onDecline?: (request: ServiceRequest, reason: string) => void;
  onTake?: (request: ServiceRequest) => void;
  onReady?: (request: ServiceRequest, note: string) => void;
  onDeliver?: (request: ServiceRequest) => void;
  onCancel?: (request: ServiceRequest, reason: string) => void;
  onRate?: (request: ServiceRequest, score: number) => void;
}

export function RequestSheet({
  request,
  me,
  onClose,
  onNote,
  onApprove,
  onDecline,
  onTake,
  onReady,
  onDeliver,
  onCancel,
  onRate,
}: RequestSheetProps) {
  const [body, setBody] = useState('');
  const [mode, setMode] = useState<Mode>('note');

  const service = serviceById(request.serviceId);
  const Glyph = service?.icon;
  const total = totalOf(request);
  const mine = request.requester === me;
  const myCall = awaits(request, me) && Boolean(onApprove);
  const steward = Boolean(onReady);
  const settled = request.stage === 'delivered' || request.stage === 'declined' || request.stage === 'cancelled';

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text && (mode === 'note' || mode === 'decline')) return;

    if (mode === 'approve') onApprove?.(request, text);
    else if (mode === 'decline') onDecline?.(request, text);
    else if (mode === 'ready') onReady?.(request, text);
    else if (mode === 'cancel') onCancel?.(request, text);
    else onNote(request, text);

    setBody('');
    setMode('note');
  };

  const placeholder =
    mode === 'approve'
      ? 'Anything to add? (optional)'
      : mode === 'decline'
        ? 'Why not — they will read this'
        : mode === 'ready'
          ? 'Where to collect it (optional)'
          : mode === 'cancel'
            ? 'Why you no longer need it (optional)'
            : 'Add a note to the thread';

  const action =
    mode === 'approve'
      ? 'Approve'
      : mode === 'decline'
        ? 'Decline'
        : mode === 'ready'
          ? 'Mark ready'
          : mode === 'cancel'
            ? 'Withdraw'
            : 'Send';

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden border-b border-line bg-nt-50 px-6 py-5">
          {Glyph && (
            <Glyph
              size={112}
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-5 text-brand-600/[0.06]"
            />
          )}

          <div className="relative flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="dx-eyebrow mb-1.5">
                {request.ref} · {request.category}
              </p>
              <h2 className="dx-h4 text-balance">
                {request.service}
                {request.quantity > 1 && ` × ${request.quantity}`}
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                {request.choice} · asked for {timeAgo(request.raisedAt)} by {request.requester}
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
          </div>

          <div className="relative mt-3 flex flex-wrap items-center gap-2">
            <StageChip stage={request.stage} />
            <span className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] font-medium tabular-nums text-ink">
              {total === 0 ? 'No charge' : money(total)}
            </span>
            <span className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-muted">
              {request.costCentre}
            </span>
            {request.rating !== undefined && <Rating value={request.rating} />}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1fr_16rem]">
            <div className="px-6 py-5">
              <h3 className="dx-eyebrow mb-3">How far it has got</h3>
              <ApprovalChain request={request} />

              {request.thread.some((line) => line.kind === 'note') && (
                <>
                  <h3 className="dx-eyebrow mb-3 mt-6 border-t border-line pt-5">The conversation</h3>
                  <ol className="space-y-3">
                    {request.thread.map((line, index) => (
                      <li key={`${line.at}-${index}`} className="flex gap-3">
                        {line.kind === 'event' ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-line-strong"
                            />
                            <p className="text-[0.75rem] text-ink-subtle">
                              {line.body} · {timeAgo(line.at)}
                            </p>
                          </>
                        ) : (
                          <>
                            <span
                              aria-hidden="true"
                              className={cn(
                                'grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.625rem] font-medium',
                                line.author === me
                                  ? 'bg-brand-600 text-nt-0'
                                  : 'bg-nt-100 text-ink-muted',
                              )}
                            >
                              {initials(line.author)}
                            </span>
                            <div className="min-w-0 flex-1 rounded-lg rounded-tl-none bg-nt-50 px-3.5 py-2.5">
                              <p className="text-[0.75rem] text-ink-muted">
                                <span className="font-medium text-ink">{line.author}</span> ·{' '}
                                {timeAgo(line.at)}
                              </p>
                              <p className="mt-0.5 text-body text-ink">{line.body}</p>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {request.stage === 'delivered' && onRate && request.rating === undefined && (
                <div className="mt-6 rounded-lg border border-line bg-grn-50 px-4 py-3.5">
                  <p className="text-body font-medium text-ink">How did that go?</p>
                  <p className="mb-2.5 text-[0.75rem] text-ink-muted">
                    It tells the desk which parts of the catalogue are actually working.
                  </p>
                  <Rating onRate={(score) => onRate(request, score)} />
                </div>
              )}
            </div>

            <aside className="border-t border-line bg-nt-50 px-6 py-5 lg:border-l lg:border-t-0">
              <dl className="space-y-3.5 text-[0.8125rem]">
                <div>
                  <dt className="dx-eyebrow">Asked for by</dt>
                  <dd className="mt-0.5 text-ink">
                    {request.requester} · {request.team}
                  </dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">What it is for</dt>
                  <dd className="mt-0.5 leading-relaxed text-ink">{request.reason}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Cost</dt>
                  <dd className="mt-0.5 tabular-nums text-ink">
                    {total === 0
                      ? 'Nothing to charge'
                      : request.quantity > 1
                        ? `${money(request.unitCost)} × ${request.quantity} = ${money(total)}`
                        : money(total)}
                  </dd>
                  <dd className="text-[0.75rem] text-ink-muted">{request.costCentre}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Wanted by</dt>
                  <dd className="mt-0.5 text-ink">{formatDay(request.neededBy)}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Where it goes</dt>
                  <dd className="mt-0.5 text-ink">{request.deliverTo}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Handled by</dt>
                  <dd className="mt-0.5 text-ink">{request.handler ?? 'Not picked up yet'}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>

        <form onSubmit={send} className="shrink-0 border-t border-line bg-nt-0 px-6 py-4">
          <div className="flex items-end gap-2">
            <CornerDownRight
              size={15}
              aria-hidden="true"
              className="mb-2.5 shrink-0 text-ink-subtle"
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={body ? 2 : 1}
              placeholder={placeholder}
              aria-label={placeholder}
              className="dx-field flex-1 resize-none py-2"
            />
            <button
              type="submit"
              disabled={!body.trim() && (mode === 'note' || mode === 'decline')}
              className={cn(
                'dx-btn-primary mb-0.5 disabled:cursor-not-allowed disabled:opacity-40',
                mode === 'decline' && 'bg-danger hover:bg-danger',
              )}
            >
              {mode === 'note' ? (
                <Send size={14} aria-hidden="true" />
              ) : mode === 'decline' ? (
                <X size={14} aria-hidden="true" />
              ) : (
                <Check size={14} aria-hidden="true" />
              )}
              {action}
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2 pl-6">
            {mode !== 'note' && (
              <button type="button" onClick={() => setMode('note')} className="dx-btn-ghost">
                Cancel
              </button>
            )}

            {myCall && mode === 'note' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('approve')}
                  className="dx-btn-secondary border-grn-500 text-grn-700"
                >
                  <HandCoins size={14} aria-hidden="true" />
                  Approve {total === 0 ? 'it' : money(total)}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('decline')}
                  className="dx-btn-secondary border-danger text-danger"
                >
                  <X size={14} aria-hidden="true" />
                  Decline
                </button>
              </>
            )}

            {steward && !settled && mode === 'note' && (
              <>
                {!request.handler && onTake && (
                  <button
                    type="button"
                    onClick={() => onTake(request)}
                    className="dx-btn-secondary"
                  >
                    <UserRoundPlus size={14} aria-hidden="true" />
                    Take it on
                  </button>
                )}
                {request.stage === 'arranging' && (
                  <button
                    type="button"
                    onClick={() => setMode('ready')}
                    className="dx-btn-secondary border-grn-500 text-grn-700"
                  >
                    <PackageCheck size={14} aria-hidden="true" />
                    Mark it ready
                  </button>
                )}
              </>
            )}

            {request.stage === 'ready' && onDeliver && mode === 'note' && (
              <button
                type="button"
                onClick={() => onDeliver(request)}
                className="dx-btn-secondary border-grn-500 text-grn-700"
              >
                <Check size={14} aria-hidden="true" />
                {mine ? 'I have got it' : 'Handed over'}
              </button>
            )}

            {mine && !settled && onCancel && mode === 'note' && (
              <button type="button" onClick={() => setMode('cancel')} className="dx-btn-ghost">
                <Trash2 size={14} aria-hidden="true" />
                I no longer need it
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
