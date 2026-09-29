import { useState } from 'react';
import { cn } from '../../ui/utils';
import { duration } from '../../../lib/format';
import { remainingOf } from '../../../lib/workload';
import type { Project, Task, TaskState } from '../../../lib/data';
import { TaskCard } from './TaskCard';
import { STATE_HINT, STATE_ICON, STATE_LABEL } from './plan';

interface ColumnProps {
  state: TaskState;
  tasks: Task[];
  projectOf: (task: Task) => Project | undefined;
  blockersOf: (task: Task) => Task[];
  dragged: Task | null;
  dropOk: boolean;
  onOpen: (task: Task) => void;
  onMove: (task: Task, state: TaskState) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}

export function Column({
  state,
  tasks,
  projectOf,
  blockersOf,
  dragged,
  dropOk,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: ColumnProps) {
  const [over, setOver] = useState(false);

  const Icon = STATE_ICON[state];
  const effort = tasks.reduce((total, task) => total + remainingOf(task), 0);
  const landing = dragged !== null && dragged.state !== state;

  return (
    <section
      aria-labelledby={`column-${state}`}
      onDragOver={(event) => {
        if (!landing) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = dropOk ? 'move' : 'none';
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData('text/plain');
        const task = dragged && (!id || dragged.id === id) ? dragged : null;
        if (task && task.state !== state) onMove(task, state);
      }}
      className={cn(
        'flex w-[17.5rem] shrink-0 flex-col rounded-lg border bg-nt-50 transition-colors duration-[180ms]',
        over && landing && dropOk && 'border-brand-400 bg-brand-50',
        over && landing && !dropOk && 'border-danger bg-danger-bg',
        !(over && landing) && 'border-line',
      )}
    >
      <header className="flex items-center gap-2 border-b border-line px-3.5 py-3">
        <Icon size={14} aria-hidden="true" className="shrink-0 text-ink-muted" />
        <h3 id={`column-${state}`} className="text-[0.8125rem] font-medium text-ink">
          {STATE_LABEL[state]}
        </h3>
        <span className="rounded-full bg-nt-200 px-1.5 text-[0.625rem] font-medium tabular-nums text-ink-muted">
          {tasks.length}
        </span>
        {effort > 0 && (
          <span className="ml-auto shrink-0 text-[0.6875rem] tabular-nums text-ink-subtle">
            {duration(effort)}
          </span>
        )}
      </header>

      <div className="flex min-h-[7rem] flex-1 flex-col gap-2.5 p-2.5">
        {tasks.length === 0 ? (
          <p className="m-auto px-2 text-center text-[0.75rem] text-ink-subtle">
            {over && landing ? (dropOk ? 'Drop it here' : 'Not while it is blocked') : STATE_HINT[state]}
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projectOf(task)}
              blockers={blockersOf(task)}
              dragging={dragged?.id === task.id}
              onOpen={onOpen}
              onMove={onMove}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </section>
  );
}
