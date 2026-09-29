import { useMemo, useState } from 'react';
import { AlertCircle, Gauge, Lock, Minus, Plus, Unlock, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { duration, formatDay, todayKey } from '../../../lib/format';
import { WORK_DAY, committedFor, isLive } from '../../../lib/workload';
import type { Project, Task, TaskPriority } from '../../../lib/data';
import { PRIORITY_LABEL, PRIORITY_TONE } from './plan';

const PRIORITIES: TaskPriority[] = ['critical', 'high', 'normal', 'low'];
const TITLE_MIN = 6;
const STEP = 15;
const MIN_ESTIMATE = 15;
const MAX_ESTIMATE = 480;

export interface Draft {
  title: string;
  detail: string;
  projectId: string;
  owner: string;
  priority: TaskPriority;
  estimate: number;
  due: string;
  blockedBy: string[];
}

type Errors = Partial<Record<'title' | 'due', string>>;

const FOCUS_ORDER: Array<keyof Errors> = ['title', 'due'];

interface NewTaskDialogProps {
  projects: Project[];
  all: Task[];
  me: string;
  onClose: () => void;
  onCreate: (draft: Draft) => void;
}

export function NewTaskDialog({ projects, all, me, onClose, onCreate }: NewTaskDialogProps) {
  const [draft, setDraft] = useState<Draft>({
    title: '',
    detail: '',
    projectId: projects[0]?.id ?? '',
    owner: me,
    priority: 'normal',
    estimate: 60,
    due: todayKey(),
    blockedBy: [],
  });
  const [errors, setErrors] = useState<Errors>({});

  const project = projects.find((row) => row.id === draft.projectId);
  const crew = useMemo(() => {
    const members = project?.members ?? [];
    return members.includes(me) ? members : [me, ...members];
  }, [project, me]);

  const candidates = useMemo(
    () => all.filter((task) => task.projectId === draft.projectId && isLive(task)),
    [all, draft.projectId],
  );

  const blocker = candidates.find((task) => task.id === draft.blockedBy[0]);
  const landsInBacklog = blocker !== undefined;
  const countsToday = !landsInBacklog && draft.due <= todayKey();
  const before = committedFor(all, draft.owner);
  const after = countsToday ? before + draft.estimate : before;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const step = (by: number) =>
    setDraft((current) => ({
      ...current,
      estimate: Math.min(MAX_ESTIMATE, Math.max(MIN_ESTIMATE, current.estimate + by)),
    }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.title.trim().length < TITLE_MIN)
      found.title = `Give it a title of at least ${TITLE_MIN} characters.`;
    if (!draft.due) found.due = 'Pick the day it is due.';
    else if (draft.due < todayKey()) found.due = 'A new task cannot already be late.';

    setErrors(found);

    const first = FOCUS_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(`task-${first}`)?.focus();
      return;
    }

    onCreate({ ...draft, title: draft.title.trim(), detail: draft.detail.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        noValidate
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">TaskFlow</p>
            <h2 className="dx-h4">Add a task</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              TaskFlow works out where it lands and what it does to the day.
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
            <label htmlFor="task-title" className="dx-eyebrow mb-1.5 block">
              What needs doing
            </label>
            <input
              id="task-title"
              type="text"
              value={draft.title}
              onChange={(event) => set('title', event.target.value)}
              data-autofocus
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              placeholder="Rebuild the empty states on the new tokens"
              className={cn('dx-field', errors.title && 'border-danger')}
            />
            {errors.title && (
              <p
                id="task-title-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
              >
                <AlertCircle size={12} aria-hidden="true" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="task-detail" className="dx-eyebrow mb-1.5 block">
              Any detail worth having
            </label>
            <textarea
              id="task-detail"
              value={draft.detail}
              onChange={(event) => set('detail', event.target.value)}
              rows={2}
              placeholder="Optional — the thing the next person would have to ask you."
              className="dx-field resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-project" className="dx-eyebrow mb-1.5 block">
                Project
              </label>
              <select
                id="task-project"
                value={draft.projectId}
                onChange={(event) => {
                  const projectId = event.target.value;
                  setDraft((current) => ({ ...current, projectId, blockedBy: [] }));
                }}
                className="dx-field"
              >
                {projects.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.key} · {row.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-owner" className="dx-eyebrow mb-1.5 block">
                Who does it
              </label>
              <select
                id="task-owner"
                value={draft.owner}
                onChange={(event) => set('owner', event.target.value)}
                className="dx-field"
              >
                {crew.map((person) => (
                  <option key={person} value={person}>
                    {person === me ? `${person} (you)` : person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-due" className="dx-eyebrow mb-1.5 block">
                Due
              </label>
              <input
                id="task-due"
                type="date"
                value={draft.due}
                min={todayKey()}
                onChange={(event) => set('due', event.target.value)}
                aria-invalid={Boolean(errors.due)}
                aria-describedby={errors.due ? 'task-due-error' : undefined}
                className={cn('dx-field', errors.due && 'border-danger')}
              />
              {errors.due && (
                <p
                  id="task-due-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
                >
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.due}
                </p>
              )}
            </div>

            <div>
              <span className="dx-eyebrow mb-1.5 block">How long it takes</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-STEP)}
                  disabled={draft.estimate <= MIN_ESTIMATE}
                  aria-label={`Shorten by ${STEP} minutes`}
                  className="dx-btn-secondary h-[2.625rem] w-10 shrink-0 px-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <output
                  aria-live="polite"
                  className="dx-field grid flex-1 place-items-center tabular-nums"
                >
                  {duration(draft.estimate)}
                </output>
                <button
                  type="button"
                  onClick={() => step(STEP)}
                  disabled={draft.estimate >= MAX_ESTIMATE}
                  aria-label={`Lengthen by ${STEP} minutes`}
                  className="dx-btn-secondary h-[2.625rem] w-10 shrink-0 px-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-1.5">How urgent</legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => set('priority', priority)}
                  aria-pressed={draft.priority === priority}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    draft.priority === priority
                      ? 'border-ink bg-ink font-medium text-nt-0'
                      : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_TONE[priority])}
                  />
                  {PRIORITY_LABEL[priority]}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="task-blocker" className="dx-eyebrow mb-1.5 block">
              Does something have to happen first?
            </label>
            <select
              id="task-blocker"
              value={draft.blockedBy[0] ?? ''}
              onChange={(event) =>
                set('blockedBy', event.target.value ? [event.target.value] : [])
              }
              className="dx-field"
            >
              <option value="">No — it can start straight away</option>
              {candidates.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.ref} · {task.title}
                </option>
              ))}
            </select>
          </div>

          <section
            aria-label="What happens when you add this"
            aria-live="polite"
            className={cn(
              'rounded-lg border px-4 py-3.5',
              landsInBacklog ? 'border-warning/40 bg-warning-bg' : 'border-line bg-nt-50',
            )}
          >
            <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink">
              {landsInBacklog ? (
                <Lock size={13} aria-hidden="true" className="shrink-0 text-warning" />
              ) : (
                <Unlock size={13} aria-hidden="true" className="shrink-0 text-grn-600" />
              )}
              {landsInBacklog
                ? `It waits in Backlog behind ${blocker?.title}`
                : 'It lands in To do and can start straight away'}
            </p>

            <p className="mt-1.5 text-[0.75rem] text-ink-muted">
              {landsInBacklog
                ? `${blocker?.owner} has to finish ${blocker?.ref} before anyone can pick this up.`
                : `Due ${formatDay(draft.due).toLowerCase()} · ${duration(draft.estimate)} of ${draft.owner.split(' ')[0]}'s time.`}
            </p>

            <p className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5 text-[0.75rem]">
              <Gauge size={12} aria-hidden="true" className="shrink-0 text-ink-subtle" />
              {countsToday ? (
                <span className={cn(after > WORK_DAY ? 'font-medium text-warning' : 'text-ink-muted')}>
                  {draft.owner === me ? 'Your' : `${draft.owner.split(' ')[0]}'s`} day goes from{' '}
                  {duration(before)} to {duration(after)} against a {duration(WORK_DAY)} day
                  {after > WORK_DAY && ' — that is over'}
                </span>
              ) : (
                <span className="text-ink-muted">
                  It does not touch anyone&rsquo;s day today.
                </span>
              )}
            </p>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            <Plus size={14} aria-hidden="true" />
            Add it to the board
          </button>
        </footer>
      </form>
    </Modal>
  );
}
