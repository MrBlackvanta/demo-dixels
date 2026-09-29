import { useMemo } from 'react';
import { Lock, TriangleAlert } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration, initials } from '../../../lib/format';
import {
  WORK_DAY,
  committedFor,
  isLive,
  isOverdue,
  openBlockers,
  ownersOf,
} from '../../../lib/workload';
import type { Task } from '../../../lib/data';
import { CapacityBar } from './CapacityBar';

interface TeamLoadProps {
  all: Task[];
  me: string;
  onPick: (owner: string) => void;
}

export function TeamLoad({ all, me, onPick }: TeamLoadProps) {
  const people = useMemo(
    () =>
      ownersOf(all)
        .map((person) => {
          const theirs = all.filter((task) => task.owner === person && isLive(task));
          return {
            person,
            committed: committedFor(all, person),
            live: theirs.length,
            blocked: theirs.filter((task) => openBlockers(task, all).length > 0).length,
            late: theirs.filter(isOverdue).length,
            team: theirs[0]?.team ?? '',
          };
        })
        .sort((a, b) => b.committed - a.committed),
    [all],
  );

  const over = people.filter((row) => row.committed > WORK_DAY);
  const total = people.reduce((sum, row) => sum + row.committed, 0);

  return (
    <div className="space-y-4 bg-nt-50 p-4">
      <section aria-label="How the day looks across everyone" className="dx-card px-5 py-4">
        <p className="text-body text-ink">
          {over.length === 0 ? (
            <>Nobody is over a {duration(WORK_DAY)} day.</>
          ) : (
            <>
              <span className="font-medium">
                {over.length === 1
                  ? `${over[0].person} is over a ${duration(WORK_DAY)} day`
                  : `${over.length} people are over a ${duration(WORK_DAY)} day`}
              </span>
              {over.length > 1 && <> — {over.map((row) => row.person.split(' ')[0]).join(', ')}.</>}
              {over.length === 1 && <> by {duration(over[0].committed - WORK_DAY)}.</>}
            </>
          )}
        </p>
        <p className="mt-1.5 text-[0.75rem] text-ink-muted">
          {duration(total)} committed across {people.length} people today. Only what is being worked
          on now, or due today, counts.
        </p>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {people.map((row) => (
          <li key={row.person}>
            <button
              type="button"
              onClick={() => onPick(row.person)}
              className={cn(
                'group flex h-full w-full flex-col rounded-lg border bg-nt-0 p-4 text-left shadow-sm transition-all duration-[180ms] hover:-translate-y-0.5 hover:shadow-raise',
                row.committed > WORK_DAY
                  ? 'border-warning/40 hover:border-warning'
                  : 'border-line hover:border-brand-200',
              )}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.625rem] font-medium',
                    row.person === me ? 'bg-brand-600 text-nt-0' : 'bg-brand-100 text-brand-700',
                  )}
                >
                  {initials(row.person)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-ink transition-colors group-hover:text-brand-700">
                    {row.person}
                    {row.person === me && ' (you)'}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-ink-muted">{row.team}</span>
                </span>
                {row.committed > WORK_DAY && (
                  <TriangleAlert size={14} aria-hidden="true" className="shrink-0 text-warning" />
                )}
              </div>

              <div className="mt-auto">
                <CapacityBar minutes={row.committed} compact />
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={cn(
                      'text-[0.75rem] font-medium tabular-nums',
                      row.committed > WORK_DAY ? 'text-warning' : 'text-ink',
                    )}
                  >
                    {duration(row.committed)}
                  </span>
                  <span className="text-[0.6875rem] text-ink-muted">{row.live} open</span>
                  {row.blocked > 0 && (
                    <span className="flex items-center gap-1 text-[0.6875rem] text-warning">
                      <Lock size={10} aria-hidden="true" />
                      {row.blocked}
                    </span>
                  )}
                  {row.late > 0 && (
                    <span className="text-[0.6875rem] font-medium text-danger">
                      {row.late} late
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
