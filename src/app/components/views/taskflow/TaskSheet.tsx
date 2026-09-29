import { useState } from 'react';
import { ArrowRightLeft, CornerDownRight, Link2, Lock, Send, Timer, Unlock, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { duration, formatDay, initials, timeAgo } from '../../../lib/format';
import {
  STATES,
  canEnter,
  isOverdue,
  openBlockers,
  remainingOf,
  waitingOn,
} from '../../../lib/workload';
import type { Project, Task, TaskState } from '../../../lib/data';
import { PriorityDot } from './PriorityDot';
import { STATE_ICON, STATE_LABEL, STATE_TONE } from './plan';

const LOGGABLE = [15, 30, 60];

interface TaskSheetProps {
  task: Task;
  all: Task[];
  project?: Project;
  me: string;
  onClose: () => void;
  onNote: (task: Task, body: string) => void;
  onMove: (task: Task, state: TaskState) => void;
  onLog: (task: Task, minutes: number) => void;
  onTick: (task: Task, position: number) => void;
  onHandOver: (task: Task, to: string) => void;
  onOpen: (task: Task) => void;
}

export function TaskSheet({
  task,
  all,
  project,
  me,
  onClose,
  onNote,
  onMove,
  onLog,
  onTick,
  onHandOver,
  onOpen,
}: TaskSheetProps) {
  const [body, setBody] = useState('');

  const blockers = openBlockers(task, all);
  const dependants = waitingOn(task, all);
  const named = task.blockedBy
    .map((id) => all.find((row) => row.id === id))
    .filter((row): row is Task => row !== undefined);
  const spent = task.estimate === 0 ? 0 : Math.min(100, Math.round((task.logged / task.estimate) * 100));
  const crew = project?.members.filter((person) => person !== task.owner) ?? [];

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    onNote(task, text);
    setBody('');
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl">
        <header className="shrink-0 border-b border-line bg-nt-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="dx-eyebrow mb-1.5">
                {task.ref} · {project?.name ?? 'No project'}
              </p>
              <h2 className="dx-h4 text-balance">{task.title}</h2>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">{task.detail}</p>
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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                STATE_TONE[task.state],
              )}
            >
              {STATE_LABEL[task.state]}
            </span>
            <span className="rounded-full bg-nt-100 px-2 py-0.5">
              <PriorityDot priority={task.priority} withLabel />
            </span>
            {task.origin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-muted">
                <Link2 size={10} aria-hidden="true" />
                {task.origin.module} · {task.origin.ref}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1fr_16rem]">
            <div className="px-6 py-5">
              <section aria-labelledby="deps-heading">
                <h3 id="deps-heading" className="dx-eyebrow mb-3">
                  What it is waiting on
                </h3>

                {named.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-lg border border-line bg-grn-50 px-3.5 py-2.5 text-[0.8125rem] text-grn-700">
                    <Unlock size={13} aria-hidden="true" />
                    Nothing is in the way — this can start whenever someone picks it up.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {named.map((row) => {
                      const cleared = row.state === 'done';
                      return (
                        <li key={row.id}>
                          <button
                            type="button"
                            onClick={() => onOpen(row)}
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left transition-colors duration-[180ms]',
                              cleared
                                ? 'border-line bg-nt-50 hover:bg-nt-100'
                                : 'border-warning/40 bg-warning-bg hover:border-warning',
                            )}
                          >
                            {cleared ? (
                              <Unlock size={13} aria-hidden="true" className="shrink-0 text-grn-600" />
                            ) : (
                              <Lock size={13} aria-hidden="true" className="shrink-0 text-warning" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.8125rem] font-medium text-ink">
                                {row.title}
                              </span>
                              <span className="block truncate text-[0.6875rem] text-ink-muted">
                                {row.ref} · {STATE_LABEL[row.state]} · {row.owner}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {dependants.length > 0 && (
                <section aria-labelledby="blocking-heading" className="mt-6 border-t border-line pt-5">
                  <h3 id="blocking-heading" className="dx-eyebrow mb-3">
                    {dependants.length === 1
                      ? 'One task is waiting on this'
                      : `${dependants.length} tasks are waiting on this`}
                  </h3>
                  <ul className="space-y-2">
                    {dependants.map((row) => (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(row)}
                          className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-nt-50 px-3.5 py-2.5 text-left transition-colors duration-[180ms] hover:bg-nt-100"
                        >
                          <PriorityDot priority={row.priority} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.8125rem] font-medium text-ink">
                              {row.title}
                            </span>
                            <span className="block truncate text-[0.6875rem] text-ink-muted">
                              {row.ref} · {row.owner}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {task.checklist.length > 0 && (
                <section aria-labelledby="checks-heading" className="mt-6 border-t border-line pt-5">
                  <h3 id="checks-heading" className="dx-eyebrow mb-3">
                    Steps
                  </h3>
                  <ul className="space-y-1">
                    {task.checklist.map((step, position) => (
                      <li key={step.label}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-1 py-1.5 transition-colors hover:bg-nt-50">
                          <input
                            type="checkbox"
                            checked={step.done}
                            onChange={() => onTick(task, position)}
                            className="h-4 w-4 shrink-0 rounded border-line-strong accent-brand-600"
                          />
                          <span
                            className={cn(
                              'text-[0.8125rem]',
                              step.done ? 'text-ink-subtle line-through' : 'text-ink',
                            )}
                          >
                            {step.label}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="thread-heading" className="mt-6 border-t border-line pt-5">
                <h3 id="thread-heading" className="dx-eyebrow mb-3">
                  The conversation
                </h3>
                <ol className="space-y-3">
                  {task.thread.map((line, index) => (
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
                              line.author === me ? 'bg-brand-600 text-nt-0' : 'bg-nt-100 text-ink-muted',
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
              </section>
            </div>

            <aside className="border-t border-line bg-nt-50 px-6 py-5 lg:border-l lg:border-t-0">
              <dl className="space-y-3.5 text-[0.8125rem]">
                <div>
                  <dt className="dx-eyebrow">Owner</dt>
                  <dd className="mt-0.5 text-ink">
                    {task.owner} · {task.team}
                  </dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Due</dt>
                  <dd className={cn('mt-0.5', isOverdue(task) ? 'font-medium text-danger' : 'text-ink')}>
                    {formatDay(task.due)}
                    {isOverdue(task) && ' — overdue'}
                  </dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Effort</dt>
                  <dd className="mt-1 tabular-nums text-ink">
                    {duration(task.logged)} of {duration(task.estimate)}
                  </dd>
                  <dd className="mt-1.5">
                    <span
                      aria-hidden="true"
                      className="flex h-1.5 w-full overflow-hidden rounded-full bg-nt-200"
                    >
                      <span
                        className={cn(
                          'h-full rounded-full',
                          task.logged > task.estimate ? 'bg-warning' : 'bg-brand-400',
                        )}
                        style={{ width: `${spent}%` }}
                      />
                    </span>
                    <span className="mt-1 block text-[0.6875rem] text-ink-muted">
                      {remainingOf(task) === 0 ? 'Nothing left on the estimate' : `${duration(remainingOf(task))} left`}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="dx-eyebrow">Raised</dt>
                  <dd className="mt-0.5 text-ink">{timeAgo(task.raisedAt)}</dd>
                </div>
                {task.startedAt && (
                  <div>
                    <dt className="dx-eyebrow">Started</dt>
                    <dd className="mt-0.5 text-ink">{timeAgo(task.startedAt)}</dd>
                  </div>
                )}
                {task.doneAt && (
                  <div>
                    <dt className="dx-eyebrow">Finished</dt>
                    <dd className="mt-0.5 text-ink">{timeAgo(task.doneAt)}</dd>
                  </div>
                )}
              </dl>

              {crew.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <label htmlFor="task-handover" className="dx-eyebrow mb-1.5 block">
                    <ArrowRightLeft size={11} aria-hidden="true" className="mr-1 inline" />
                    Hand it over
                  </label>
                  <select
                    id="task-handover"
                    value=""
                    onChange={(event) => event.target.value && onHandOver(task, event.target.value)}
                    className="dx-field"
                  >
                    <option value="">Keep it with {task.owner.split(' ')[0]}</option>
                    {crew.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="shrink-0 border-t border-line bg-nt-0 px-6 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="dx-eyebrow">Move it</span>
            {STATES.map((state) => {
              const Icon = STATE_ICON[state];
              const current = state === task.state;
              const allowed = canEnter(task, state, all);

              return (
                <button
                  key={state}
                  type="button"
                  disabled={current || !allowed}
                  title={
                    !allowed && !current
                      ? `Blocked by ${blockers.map((row) => row.title).join(', ')}`
                      : undefined
                  }
                  onClick={() => onMove(task, state)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] transition-all duration-[180ms]',
                    current
                      ? 'cursor-default border-brand-600 bg-brand-600 font-medium text-nt-0'
                      : allowed
                        ? 'border-line bg-nt-0 text-ink-muted hover:border-brand-300 hover:text-brand-700'
                        : 'cursor-not-allowed border-line bg-nt-50 text-ink-subtle',
                  )}
                >
                  <Icon size={12} aria-hidden="true" />
                  {STATE_LABEL[state]}
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="dx-eyebrow">
              <Timer size={11} aria-hidden="true" className="mr-1 inline" />
              Log time
            </span>
            {LOGGABLE.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onLog(task, minutes)}
                className="rounded-full border border-line bg-nt-0 px-3 py-1.5 text-[0.75rem] tabular-nums text-ink-muted transition-all duration-[180ms] hover:border-brand-300 hover:text-brand-700"
              >
                + {duration(minutes)}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="flex items-end gap-2">
            <CornerDownRight size={15} aria-hidden="true" className="mb-2.5 shrink-0 text-ink-subtle" />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={body ? 2 : 1}
              data-autofocus
              placeholder="Add a note to the thread"
              aria-label="Add a note to the thread"
              className="dx-field flex-1 resize-none py-2"
            />
            <button
              type="submit"
              disabled={!body.trim()}
              className="dx-btn-primary mb-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={14} aria-hidden="true" />
              Send
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
