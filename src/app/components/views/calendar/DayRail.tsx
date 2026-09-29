import { AlertTriangle, ArrowRight, CalendarCheck, Shield, Sparkles } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration } from '../../../lib/format';
import {
  WORK_SPAN,
  bookedInWorkday,
  byStart,
  clashesFor,
  freeInWorkday,
  holdsTime,
  longestWorkGap,
  relativeDay,
  taskMinutesFor,
} from '../../../lib/agenda';
import type { Meeting, Task } from '../../../lib/data';

interface DayRailProps {
  date: string;
  meetings: Meeting[];
  tasks: Task[];
  me: string;
  onProtect: (date: string, start: string, minutes: number) => void;
  onOpen: (meeting: Meeting) => void;
  onFindTime: () => void;
}

export function DayRail({
  date,
  meetings,
  tasks,
  me,
  onProtect,
  onOpen,
  onFindTime,
}: DayRailProps) {
  const booked = bookedInWorkday(meetings, me, date);
  const free = freeInWorkday(meetings, me, date);
  const needed = taskMinutesFor(tasks, me, date);
  const short = needed - free;

  const clashing = meetings
    .filter(
      (meeting) =>
        meeting.date === date &&
        holdsTime(meeting, me) &&
        clashesFor(meetings, [me], date, meeting.start, meeting.end, meeting.id).length > 0,
    )
    .sort(byStart);

  const gap = longestWorkGap(meetings, me, date);
  const protectable = gap && gap.minutes >= 30 ? gap : undefined;
  const fill = Math.min(100, Math.round((booked / WORK_SPAN) * 100));

  return (
    <div className="space-y-4">
      <section aria-labelledby="fit-heading" className="dx-card overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <h3 id="fit-heading" className="dx-eyebrow">
            Does {relativeDay(date).toLowerCase()} fit
          </h3>
        </div>

        <div className="px-5 py-4">
          <p
            className={cn(
              'text-[1.0625rem] leading-snug tracking-[-0.02em]',
              short > 0 ? 'text-warning' : 'text-ink',
            )}
          >
            {needed === 0
              ? 'Nothing from TaskFlow needs time today.'
              : short > 0
                ? `You are ${duration(short)} short.`
                : `It fits, with ${duration(-short)} to spare.`}
          </p>

          <p className="mt-1.5 text-[0.75rem] text-ink-muted">
            {duration(booked)} in meetings · {duration(free)} open ·{' '}
            {duration(needed)} of task work
          </p>

          <div
            role="meter"
            aria-valuemin={0}
            aria-valuemax={WORK_SPAN}
            aria-valuenow={booked}
            aria-valuetext={`${duration(booked)} of a ${duration(WORK_SPAN)} working day is in meetings`}
            aria-label="How much of the working day is already in meetings"
            className="mt-3.5 h-2 overflow-hidden rounded-full bg-nt-100"
          >
            <span
              style={{ width: `${fill}%` }}
              className={cn(
                'block h-full rounded-full transition-[width] duration-500',
                short > 0 ? 'bg-warning' : 'bg-brand-500',
              )}
            />
          </div>

          <p className="mt-2 text-[0.6875rem] text-ink-subtle">
            Against a {duration(WORK_SPAN)} working day, 09:00 to 18:00.
          </p>
        </div>
      </section>

      {clashing.length > 0 && (
        <section aria-labelledby="clash-heading" className="dx-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-warning-bg px-5 py-3">
            <AlertTriangle size={13} aria-hidden="true" className="shrink-0 text-warning" />
            <h3 id="clash-heading" className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-warning">
              {clashing.length} {clashing.length === 1 ? 'clash' : 'clashes'}
            </h3>
          </div>

          <ul className="divide-y divide-line">
            {clashing.map((meeting) => (
              <li key={meeting.id}>
                <button
                  type="button"
                  onClick={() => onOpen(meeting)}
                  className="flex w-full items-center gap-2.5 px-5 py-2.5 text-left transition-colors duration-[140ms] hover:bg-nt-50"
                >
                  <span className="w-10 shrink-0 text-[0.6875rem] tabular-nums text-ink-muted">
                    {meeting.start}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">
                    {meeting.title}
                  </span>
                  <ArrowRight size={12} aria-hidden="true" className="shrink-0 text-ink-subtle" />
                </button>
              </li>
            ))}
          </ul>

          <p className="border-t border-line px-5 py-2.5 text-[0.6875rem] text-ink-muted">
            Open one to answer it or move it.
          </p>
        </section>
      )}

      {protectable && (
        <section aria-labelledby="protect-heading" className="dx-card p-5">
          <div className="mb-2.5 flex items-center gap-2">
            <Shield size={13} aria-hidden="true" className="shrink-0 text-grn-600" />
            <h3 id="protect-heading" className="dx-eyebrow">
              Your longest clear run
            </h3>
          </div>

          <p className="text-[0.875rem] text-ink">
            {duration(protectable.minutes)} between {protectable.start} and {protectable.end}.
          </p>
          <p className="mt-1 text-[0.75rem] text-ink-muted">
            {needed > 0
              ? 'Block it before somebody books over it.'
              : 'Nothing is competing for it yet.'}
          </p>

          <button
            type="button"
            onClick={() => onProtect(date, protectable.start, Math.min(protectable.minutes, 120))}
            className="dx-btn-secondary mt-3 w-full"
          >
            <CalendarCheck size={14} aria-hidden="true" />
            Hold {duration(Math.min(protectable.minutes, 120))} for focus
          </button>
        </section>
      )}

      <section aria-labelledby="find-heading" className="relative overflow-hidden rounded-lg p-5 text-nt-0">
        <div className="dx-wash-deep absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <div className="mb-2.5 flex items-center gap-2">
            <Sparkles size={13} aria-hidden="true" />
            <h3 id="find-heading" className="text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
              Find a time
            </h3>
          </div>

          <p className="text-[0.875rem] leading-snug">
            Pick the people. I will find the first window where every one of them is free — and a
            room that is free too.
          </p>

          <button
            type="button"
            onClick={onFindTime}
            className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-nt-0/15 px-3.5 py-2 text-[0.8125rem] font-medium backdrop-blur-sm transition-colors duration-[180ms] hover:bg-nt-0/25"
          >
            Work out when
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
