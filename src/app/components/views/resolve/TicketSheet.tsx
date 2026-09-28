import { useState } from 'react';
import { ArrowUpRight, Check, CornerDownRight, RotateCcw, Send, UserRoundPlus, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { initials, timeAgo } from '../../../lib/format';
import type { Ticket, TicketPriority } from '../../../lib/data';
import { Rating } from '../../shell/Rating';
import { SlaPill } from './SlaPill';
import {
  AGENTS,
  PRIORITIES,
  PRIORITY_TARGET,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  TEAM_ICON,
  needsRating,
} from './support';

interface TicketSheetProps {
  ticket: Ticket;
  me: string;
  onClose: () => void;
  onNote: (ticket: Ticket, body: string) => void;
  onRate?: (ticket: Ticket, score: number) => void;
  onReopen?: (ticket: Ticket, reason: string) => void;
  onAssign?: (ticket: Ticket, agent: string) => void;
  onEscalate?: (ticket: Ticket, priority: TicketPriority) => void;
  onHold?: (ticket: Ticket, question: string) => void;
  onResolve?: (ticket: Ticket, summary: string) => void;
}

export function TicketSheet({
  ticket,
  me,
  onClose,
  onNote,
  onRate,
  onReopen,
  onAssign,
  onEscalate,
  onHold,
  onResolve,
}: TicketSheetProps) {
  const [body, setBody] = useState('');
  const [mode, setMode] = useState<'note' | 'hold' | 'resolve' | 'reopen'>('note');

  const Glyph = TEAM_ICON[ticket.team];
  const closed = ticket.status === 'resolved';
  const steward = Boolean(onAssign);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text && mode !== 'resolve') return;

    if (mode === 'hold' && onHold) onHold(ticket, text);
    else if (mode === 'resolve' && onResolve) onResolve(ticket, text);
    else if (mode === 'reopen' && onReopen) onReopen(ticket, text);
    else onNote(ticket, text);

    setBody('');
    setMode('note');
  };

  const placeholder =
    mode === 'hold'
      ? `What do you need from ${ticket.requester.split(' ')[0]}?`
      : mode === 'resolve'
        ? 'What fixed it? (optional)'
        : mode === 'reopen'
          ? 'What is still wrong?'
          : 'Add a note to the thread';

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden border-b border-line bg-nt-50 px-6 py-5">
          <Glyph
            size={112}
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-5 text-brand-600/[0.06]"
          />

          <div className="relative flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="dx-eyebrow mb-1.5">
                {ticket.ref} · {ticket.team} · {ticket.category}
              </p>
              <h2 className="dx-h4 text-balance">{ticket.subject}</h2>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                {ticket.location} · raised {timeAgo(ticket.openedAt)} by {ticket.requester}
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
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                STATUS_TONE[ticket.status],
              )}
            >
              {ticket.status === 'waiting' && ticket.requester !== me
                ? `Waiting on ${ticket.requester.split(' ')[0]}`
                : STATUS_LABEL[ticket.status]}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium capitalize',
                PRIORITY_TONE[ticket.priority],
              )}
            >
              {ticket.priority}
            </span>
            <SlaPill ticket={ticket} />
            {ticket.rating !== undefined && <Rating value={ticket.rating} />}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1fr_15rem]">
            <div className="px-6 py-5">
              <p className="mb-4 rounded-lg bg-nt-50 px-4 py-3 text-body text-ink">{ticket.detail}</p>

              <ol className="space-y-3">
                {ticket.thread.map((line, index) => (
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

              {closed && onRate && needsRating(ticket) && (
                <div className="mt-5 rounded-lg border border-line bg-grn-50 px-4 py-3.5">
                  <p className="text-body font-medium text-ink">How did that go?</p>
                  <p className="mb-2.5 text-[0.75rem] text-ink-muted">
                    It helps the {ticket.team} team see what is working.
                  </p>
                  <Rating onRate={(score) => onRate(ticket, score)} />
                </div>
              )}
            </div>

            <aside className="border-t border-line bg-nt-50 px-6 py-5 lg:border-l lg:border-t-0">
              <dl className="space-y-3.5 text-[0.8125rem]">
                <div>
                  <dt className="dx-eyebrow">Raised by</dt>
                  <dd className="mt-0.5 text-ink">{ticket.requester}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Handled by</dt>
                  <dd className="mt-0.5 text-ink">{ticket.assignee ?? 'Not picked up yet'}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Where</dt>
                  <dd className="mt-0.5 text-ink">{ticket.location}</dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Target</dt>
                  <dd className="mt-0.5 text-ink">{PRIORITY_TARGET[ticket.priority]}</dd>
                  <dd className="mt-1.5">
                    <SlaPill ticket={ticket} withBar />
                  </dd>
                </div>
              </dl>

              {steward && !closed && (
                <div className="mt-5 space-y-3 border-t border-line pt-4">
                  <div>
                    <label htmlFor="sheet-assignee" className="dx-eyebrow mb-1.5 block">
                      Assign to
                    </label>
                    <select
                      id="sheet-assignee"
                      value={ticket.assignee ?? ''}
                      onChange={(event) => onAssign?.(ticket, event.target.value)}
                      className="dx-field"
                    >
                      <option value="" disabled>
                        Pick an agent
                      </option>
                      {AGENTS[ticket.team].map((agent) => (
                        <option key={agent} value={agent}>
                          {agent}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sheet-priority" className="dx-eyebrow mb-1.5 block">
                      Priority
                    </label>
                    <select
                      id="sheet-priority"
                      value={ticket.priority}
                      onChange={(event) =>
                        onEscalate?.(ticket, event.target.value as TicketPriority)
                      }
                      className="dx-field capitalize"
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority} className="capitalize">
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
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
              disabled={!body.trim() && mode !== 'resolve'}
              className="dx-btn-primary mb-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {mode === 'resolve' ? <Check size={14} aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
              {mode === 'resolve' ? 'Resolve' : mode === 'hold' ? 'Ask' : mode === 'reopen' ? 'Reopen' : 'Send'}
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2 pl-6">
            {mode !== 'note' && (
              <button type="button" onClick={() => setMode('note')} className="dx-btn-ghost">
                Cancel
              </button>
            )}

            {steward && !closed && mode === 'note' && (
              <>
                <button type="button" onClick={() => setMode('hold')} className="dx-btn-secondary">
                  <ArrowUpRight size={14} aria-hidden="true" />
                  Ask {ticket.requester.split(' ')[0]} something
                </button>
                <button
                  type="button"
                  onClick={() => setMode('resolve')}
                  className="dx-btn-secondary border-grn-500 text-grn-700"
                >
                  <Check size={14} aria-hidden="true" />
                  Mark resolved
                </button>
              </>
            )}

            {steward && !closed && !ticket.assignee && mode === 'note' && (
              <button
                type="button"
                onClick={() => onAssign?.(ticket, me)}
                className="dx-btn-secondary"
              >
                <UserRoundPlus size={14} aria-hidden="true" />
                Take it myself
              </button>
            )}

            {closed && onReopen && mode === 'note' && (
              <button type="button" onClick={() => setMode('reopen')} className="dx-btn-secondary">
                <RotateCcw size={14} aria-hidden="true" />
                This is not fixed
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
