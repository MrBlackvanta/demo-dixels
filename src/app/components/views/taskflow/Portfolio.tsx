import { CalendarDays, Lock, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration, formatDay, initials } from '../../../lib/format';
import {
  healthOf,
  isDone,
  isOverdue,
  openBlockers,
  progressOf,
  remainingOf,
  tasksOf,
} from '../../../lib/workload';
import type { Project, Task } from '../../../lib/data';
import { HEALTH_LABEL, HEALTH_TONE } from './plan';

interface PortfolioProps {
  projects: Project[];
  all: Task[];
  onPick: (projectId: string) => void;
}

export function Portfolio({ projects, all, onPick }: PortfolioProps) {
  return (
    <ul className="grid gap-3 bg-nt-50 p-4 sm:grid-cols-2">
      {projects.map((project) => {
        const rows = tasksOf(all, project.id);
        const health = healthOf(all, project.id);
        const progress = progressOf(all, project.id);
        const done = rows.filter(isDone).length;
        const late = rows.filter(isOverdue);
        const stuck = rows.filter((task) => !isDone(task) && openBlockers(task, all).length > 0);
        const left = rows.filter((task) => !isDone(task)).reduce((sum, task) => sum + remainingOf(task), 0);

        return (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => onPick(project.id)}
              className="group flex h-full w-full flex-col rounded-lg border border-line bg-nt-0 p-5 text-left shadow-sm transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise"
            >
              <div className="mb-2.5 flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-50 text-[0.6875rem] font-medium tracking-wide text-brand-700"
                >
                  {project.key}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-ink transition-colors group-hover:text-brand-700">
                    {project.name}
                  </span>
                  <span className="block truncate text-[0.75rem] text-ink-muted">
                    {project.lead} · {project.team}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                    HEALTH_TONE[health],
                  )}
                >
                  {HEALTH_LABEL[health]}
                </span>
              </div>

              <p className="mb-4 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                {project.summary}
              </p>

              <div className="mt-auto">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[0.75rem] text-ink-muted">
                    {done} of {rows.length} done
                  </span>
                  <span className="text-[0.75rem] font-medium tabular-nums text-ink">
                    {progress}%
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-1.5 w-full overflow-hidden rounded-full bg-nt-100"
                >
                  <span
                    className={cn(
                      'h-full rounded-full transition-[width] duration-500 ease-dx',
                      health === 'shipped'
                        ? 'bg-grn-500'
                        : health === 'blocked'
                          ? 'bg-danger'
                          : health === 'at-risk'
                            ? 'bg-warning'
                            : 'bg-brand-500',
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </span>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
                    <CalendarDays size={11} aria-hidden="true" />
                    {formatDay(project.due)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
                    <Users size={11} aria-hidden="true" />
                    {project.members.length}
                  </span>
                  {left > 0 && (
                    <span className="text-[0.6875rem] tabular-nums text-ink-muted">
                      {duration(left)} left
                    </span>
                  )}
                  {stuck.length > 0 && (
                    <span className="flex items-center gap-1 text-[0.6875rem] text-warning">
                      <Lock size={10} aria-hidden="true" />
                      {stuck.length} blocked
                    </span>
                  )}
                  {late.length > 0 && (
                    <span className="text-[0.6875rem] font-medium text-danger">
                      {late.length} overdue
                    </span>
                  )}
                </div>

                <div className="mt-3 flex -space-x-1.5">
                  {project.members.slice(0, 6).map((person) => (
                    <span
                      key={person}
                      title={person}
                      className="grid h-6 w-6 place-items-center rounded-full border-2 border-nt-0 bg-nt-100 text-[0.5625rem] font-medium text-ink-muted"
                    >
                      {initials(person)}
                    </span>
                  ))}
                  {project.members.length > 6 && (
                    <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-nt-0 bg-nt-200 text-[0.5625rem] font-medium text-ink-muted">
                      +{project.members.length - 6}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
