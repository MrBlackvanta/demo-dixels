import { Lock } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration, formatDay } from '../../../lib/format';
import { isOverdue, remainingOf } from '../../../lib/workload';
import type { Project, Task } from '../../../lib/data';
import { PriorityDot } from './PriorityDot';
import { STATE_LABEL, STATE_TONE } from './plan';

interface TaskRowProps {
  task: Task;
  project?: Project;
  blockers: Task[];
  withOwner?: boolean;
  onOpen: (task: Task) => void;
}

export function TaskRow({ task, project, blockers, withOwner = false, onOpen }: TaskRowProps) {
  const late = isOverdue(task);

  return (
    <li className="relative">
      {blockers.length > 0 && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-warning" />
      )}

      <div
        className={cn(
          'grid items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors duration-[180ms] hover:bg-nt-50',
          'grid-cols-[auto_minmax(0,1fr)_auto] xl:grid-cols-[auto_minmax(0,1fr)_6rem_5rem_6.5rem]',
        )}
      >
        <PriorityDot priority={task.priority} />

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(task)}
            className="block w-full truncate rounded-sm text-left text-body font-medium text-ink transition-colors hover:text-brand-700"
          >
            {task.title}
          </button>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.75rem] text-ink-muted">
            <span className="tabular-nums">{task.ref}</span>
            {project && <span>· {project.key}</span>}
            {withOwner && <span>· {task.owner}</span>}
            {blockers.length > 0 && (
              <span className="inline-flex items-center gap-1 text-warning">
                <Lock size={10} aria-hidden="true" />
                waiting on {blockers[0].ref}
              </span>
            )}
          </p>
        </div>

        <span
          className={cn(
            'shrink-0 justify-self-end text-[0.75rem] tabular-nums xl:justify-self-start',
            late ? 'font-medium text-danger' : 'text-ink-muted',
          )}
        >
          {formatDay(task.due)}
        </span>

        <span className="hidden shrink-0 text-[0.75rem] tabular-nums text-ink-subtle xl:block">
          {duration(remainingOf(task))}
        </span>

        <span
          className={cn(
            'hidden shrink-0 justify-self-start rounded-full px-2 py-0.5 text-[0.6875rem] font-medium xl:block',
            STATE_TONE[task.state],
          )}
        >
          {STATE_LABEL[task.state]}
        </span>
      </div>
    </li>
  );
}
