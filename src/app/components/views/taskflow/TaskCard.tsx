import { ChevronLeft, ChevronRight, Link2, Lock, MessageSquare, Paperclip } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration, formatDay, initials } from '../../../lib/format';
import { STATES, doneChecks, isOverdue, remainingOf } from '../../../lib/workload';
import type { Project, Task, TaskState } from '../../../lib/data';
import { PriorityDot } from './PriorityDot';
import { STATE_LABEL } from './plan';

interface TaskCardProps {
  task: Task;
  project?: Project;
  blockers: Task[];
  dragging: boolean;
  onOpen: (task: Task) => void;
  onMove: (task: Task, state: TaskState) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}

export function TaskCard({
  task,
  project,
  blockers,
  dragging,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const position = STATES.indexOf(task.state);
  const previous = STATES[position - 1];
  const next = STATES[position + 1];
  const notes = task.thread.filter((line) => line.kind === 'note').length;
  const late = isOverdue(task);

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative cursor-grab rounded-lg border border-line bg-nt-0 p-3 shadow-sm transition-all duration-[180ms]',
        'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise focus-within:border-brand-200',
        dragging && 'rotate-[0.5deg] cursor-grabbing opacity-40',
      )}
    >
      {blockers.length > 0 && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg bg-warning" />
      )}

      <div className="mb-1.5 flex items-center gap-1.5">
        <PriorityDot priority={task.priority} />
        <span className="text-[0.625rem] font-medium tabular-nums text-ink-subtle">{task.ref}</span>
        {project && (
          <span className="truncate rounded-sm bg-nt-100 px-1.5 text-[0.625rem] font-medium text-ink-muted">
            {project.key}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="block w-full rounded-sm text-left text-[0.8125rem] font-medium leading-snug text-ink transition-colors hover:text-brand-700"
      >
        <span className="line-clamp-2">{task.title}</span>
      </button>

      {blockers.length > 0 && (
        <p className="mt-2 flex items-start gap-1.5 rounded-sm bg-warning-bg px-2 py-1.5 text-[0.6875rem] text-warning">
          <Lock size={11} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span className="min-w-0">
            Waiting on {blockers[0].title}
            {blockers.length > 1 && ` and ${blockers.length - 1} more`}
          </span>
        </p>
      )}

      {task.origin && (
        <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-subtle">
          <Link2 size={11} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {task.origin.module} · {task.origin.ref}
          </span>
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5">
        <span
          aria-hidden="true"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[0.5625rem] font-medium text-brand-700"
        >
          {initials(task.owner)}
        </span>
        <span className="sr-only">{task.owner}</span>

        <span
          className={cn(
            'shrink-0 text-[0.6875rem] tabular-nums',
            late ? 'font-medium text-danger' : 'text-ink-muted',
          )}
        >
          {formatDay(task.due)}
        </span>

        <span className="shrink-0 text-[0.6875rem] tabular-nums text-ink-subtle">
          {duration(remainingOf(task))}
        </span>

        {task.checklist.length > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-[0.6875rem] tabular-nums text-ink-subtle">
            <Paperclip size={10} aria-hidden="true" />
            {doneChecks(task)}/{task.checklist.length}
          </span>
        )}

        {notes > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-[0.6875rem] tabular-nums text-ink-subtle">
            <MessageSquare size={10} aria-hidden="true" />
            {notes}
          </span>
        )}

        <span className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 group-focus-within:opacity-100">
          {previous && (
            <button
              type="button"
              onClick={() => onMove(task, previous)}
              className="grid h-6 w-6 place-items-center rounded-sm text-ink-subtle transition-colors hover:bg-nt-100 hover:text-ink"
            >
              <ChevronLeft size={13} aria-hidden="true" />
              <span className="sr-only">
                Move {task.title} back to {STATE_LABEL[previous]}
              </span>
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={() => onMove(task, next)}
              className="grid h-6 w-6 place-items-center rounded-sm text-ink-subtle transition-colors hover:bg-nt-100 hover:text-ink"
            >
              <ChevronRight size={13} aria-hidden="true" />
              <span className="sr-only">
                Move {task.title} on to {STATE_LABEL[next]}
              </span>
            </button>
          )}
        </span>
      </div>
    </article>
  );
}
