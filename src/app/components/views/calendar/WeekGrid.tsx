import { cn } from '../../ui/utils';
import { todayKey } from '../../../lib/format';
import { busyMinutes, dayNumber, isWeekend, weekdayLabel } from '../../../lib/agenda';
import type { Meeting, Space } from '../../../lib/data';
import { DayGrid, GRID_HEIGHT, HourGutter } from './DayGrid';

interface WeekGridProps {
  days: string[];
  meetings: Meeting[];
  spaces: Space[];
  me: string;
  dragged: Meeting | null;
  onOpen: (meeting: Meeting) => void;
  onDragStart: (meeting: Meeting) => void;
  onDragEnd: () => void;
  onDrop: (meeting: Meeting, date: string, start: string) => void;
  onCreateAt: (date: string, start: string) => void;
  onPickDay: (date: string) => void;
}

export function WeekGrid({
  days,
  meetings,
  spaces,
  me,
  dragged,
  onOpen,
  onDragStart,
  onDragEnd,
  onDrop,
  onCreateAt,
  onPickDay,
}: WeekGridProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[52rem]">
        <div className="sticky top-0 z-30 flex border-b border-line bg-nt-0/95 backdrop-blur-sm">
          <div className="w-12 shrink-0 sm:w-14" />
          {days.map((date) => {
            const load = busyMinutes(meetings, me, date);
            const isToday = date === todayKey();

            return (
              <button
                key={date}
                type="button"
                onClick={() => onPickDay(date)}
                className={cn(
                  'min-w-0 flex-1 border-l border-line px-2 py-2.5 text-center transition-colors duration-[140ms] hover:bg-nt-50',
                  isWeekend(date) && 'bg-nt-50/70',
                )}
              >
                <span className="block text-[0.625rem] uppercase tracking-[0.1em] text-ink-subtle">
                  {weekdayLabel(date)}
                </span>
                <span
                  className={cn(
                    'mx-auto mt-1 grid h-6 w-6 place-items-center rounded-full text-[0.8125rem] tabular-nums',
                    isToday ? 'bg-brand-600 font-medium text-nt-0' : 'text-ink',
                  )}
                >
                  {dayNumber(date)}
                </span>
                <span className="mt-1 block text-[0.5625rem] tabular-nums text-ink-subtle">
                  {load === 0 ? 'clear' : `${Math.round((load / 60) * 10) / 10}h`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex" style={{ height: GRID_HEIGHT }}>
          <HourGutter />
          {days.map((date) => (
            <div key={date} className={cn('min-w-0 flex-1', isWeekend(date) && 'bg-nt-50/50')}>
              <DayGrid
                date={date}
                meetings={meetings.filter((meeting) => meeting.date === date)}
                spaces={spaces}
                me={me}
                dragged={dragged}
                withHours={false}
                compact
                onOpen={onOpen}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
                onCreateAt={onCreateAt}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
