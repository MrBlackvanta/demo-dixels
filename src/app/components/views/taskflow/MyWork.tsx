import { useMemo } from 'react';
import { CheckCircle2, HandHeart } from 'lucide-react';
import { shiftDay, todayKey } from '../../../lib/format';
import { committedFor, isDone, isLive, openBlockers } from '../../../lib/workload';
import type { Project, Task } from '../../../lib/data';
import { CapacityBar } from './CapacityBar';
import { TaskRow } from './TaskRow';
import { BUCKET_LABEL, byDue, bucketOf } from './plan';
import type { Bucket } from './plan';

const ORDER: Bucket[] = ['late', 'today', 'week', 'later'];

interface MyWorkProps {
  all: Task[];
  projects: Project[];
  me: string;
  onOpen: (task: Task) => void;
}

export function MyWork({ all, projects, me, onOpen }: MyWorkProps) {
  const weekEnd = shiftDay(todayKey(), 7);
  const projectOf = (task: Task) => projects.find((row) => row.id === task.projectId);
  const blockersOf = (task: Task) => openBlockers(task, all);

  const mine = useMemo(() => all.filter((task) => task.owner === me), [all, me]);
  const live = useMemo(() => mine.filter(isLive).sort(byDue), [mine]);
  const finished = useMemo(
    () => mine.filter(isDone).sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? '')),
    [mine],
  );

  const holdingUp = useMemo(
    () =>
      all
        .filter(
          (task) =>
            task.owner !== me &&
            isLive(task) &&
            openBlockers(task, all).some((blocker) => blocker.owner === me),
        )
        .sort(byDue),
    [all, me],
  );

  const buckets = ORDER.map((bucket) => ({
    bucket,
    rows: live.filter((task) => bucketOf(task, weekEnd) === bucket),
  })).filter((group) => group.rows.length > 0);

  return (
    <div className="space-y-5 bg-nt-50 p-4">
      <section aria-labelledby="day-heading" className="dx-card px-5 py-4">
        <h3 id="day-heading" className="dx-eyebrow mb-3">
          Your day
        </h3>
        <CapacityBar minutes={committedFor(all, me)} label="Committed for today" />
        <p className="mt-2.5 text-[0.75rem] text-ink-muted">
          Everything you are working on now, plus anything of yours due today. Tasks further out do
          not count against it.
        </p>
      </section>

      {holdingUp.length > 0 && (
        <section aria-labelledby="holding-heading" className="dx-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-warning-bg px-5 py-3">
            <HandHeart size={14} aria-hidden="true" className="shrink-0 text-warning" />
            <h3 id="holding-heading" className="text-[0.8125rem] font-medium text-warning">
              {holdingUp.length === 1
                ? 'One person is waiting on you'
                : `${holdingUp.length} tasks are waiting on you`}
            </h3>
          </div>
          <ul className="divide-y divide-line">
            {holdingUp.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projectOf(task)}
                blockers={blockersOf(task)}
                withOwner
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      )}

      {buckets.map(({ bucket, rows }) => (
        <section key={bucket} aria-labelledby={`bucket-${bucket}`} className="dx-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3">
            <h3 id={`bucket-${bucket}`} className="dx-eyebrow">
              {BUCKET_LABEL[bucket]}
            </h3>
            <span className="rounded-full bg-nt-100 px-1.5 text-[0.625rem] font-medium tabular-nums text-ink-muted">
              {rows.length}
            </span>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projectOf(task)}
                blockers={blockersOf(task)}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      ))}

      {finished.length > 0 && (
        <section aria-labelledby="finished-heading" className="dx-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3">
            <CheckCircle2 size={14} aria-hidden="true" className="shrink-0 text-grn-600" />
            <h3 id="finished-heading" className="dx-eyebrow">
              Finished
            </h3>
            <span className="rounded-full bg-nt-100 px-1.5 text-[0.625rem] font-medium tabular-nums text-ink-muted">
              {finished.length}
            </span>
          </div>
          <ul className="divide-y divide-line">
            {finished.slice(0, 5).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projectOf(task)}
                blockers={[]}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
