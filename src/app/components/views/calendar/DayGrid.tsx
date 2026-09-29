import { useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../ui/utils';
import { toClock, toMinutes } from '../../../lib/format';
import { CLOSES, DAY_MINUTES, HOURS, OPENS, SLOT, layoutOf, nowOffset } from '../../../lib/agenda';
import type { Gap } from '../../../lib/agenda';
import type { Meeting, Space } from '../../../lib/data';
import { MeetingBlock } from './MeetingBlock';

export const HOUR_HEIGHT = 58;

export const GRID_HEIGHT = ((CLOSES - OPENS) / 60) * HOUR_HEIGHT;

export function HourGutter() {
  return (
    <div className="w-12 shrink-0 sm:w-14" aria-hidden="true">
      {HOURS.slice(0, -1).map((hour) => (
        <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
          <span className="absolute -top-1.5 right-2 text-[0.625rem] tabular-nums text-ink-subtle">
            {String(hour).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  );
}

interface DayGridProps {
  date: string;
  meetings: Meeting[];
  spaces: Space[];
  me: string;
  dragged: Meeting | null;
  withHours?: boolean;
  compact?: boolean;
  gaps?: Gap[];
  onOpen: (meeting: Meeting) => void;
  onDragStart: (meeting: Meeting) => void;
  onDragEnd: () => void;
  onDrop: (meeting: Meeting, date: string, start: string) => void;
  onCreateAt: (date: string, start: string) => void;
}

export function DayGrid({
  date,
  meetings,
  spaces,
  me,
  dragged,
  withHours = true,
  compact = false,
  gaps = [],
  onOpen,
  onDragStart,
  onDragEnd,
  onDrop,
  onCreateAt,
}: DayGridProps) {
  const surface = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const now = nowOffset(date);
  const seats = useMemo(() => layoutOf(meetings), [meetings]);

  const clockFrom = (clientY: number): string => {
    const box = surface.current?.getBoundingClientRect();
    if (!box) return toClock(OPENS);
    const ratio = Math.min(Math.max((clientY - box.top) / box.height, 0), 1);
    const raw = OPENS + ratio * DAY_MINUTES;
    return toClock(Math.min(Math.round(raw / SLOT) * SLOT, CLOSES - SLOT));
  };

  return (
    <div className="flex" style={{ height: GRID_HEIGHT }}>
      {withHours && <HourGutter />}

      <div ref={surface} className="relative min-w-0 flex-1 border-l border-line">
        {HOURS.slice(0, -1).map((hour) => (
          <div
            key={hour}
            style={{ height: HOUR_HEIGHT }}
            className="border-b border-line/70 last:border-b-0"
          />
        ))}

        {gaps.map((gap) => {
          const top = ((toMinutes(gap.start) - OPENS) / DAY_MINUTES) * 100;
          const size = (gap.minutes / DAY_MINUTES) * 100;
          return (
            <button
              key={gap.start}
              type="button"
              onClick={() => onCreateAt(date, gap.start)}
              style={{ top: `${top}%`, height: `${size}%` }}
              className="group absolute inset-x-0 z-0 flex items-center justify-center rounded-md border border-dashed border-transparent transition-colors duration-[140ms] hover:border-brand-300 hover:bg-brand-50/60"
            >
              <span className="flex items-center gap-1 text-[0.625rem] text-ink-subtle opacity-0 transition-opacity duration-[140ms] group-hover:opacity-100">
                <Plus size={10} aria-hidden="true" />
                {gap.minutes >= 60 ? `${Math.floor(gap.minutes / 60)}h free` : `${gap.minutes}m free`}
              </span>
              <span className="sr-only">
                Put something in the free time at {gap.start} on {date}
              </span>
            </button>
          );
        })}

        {meetings.map((meeting) => (
          <MeetingBlock
            key={meeting.id}
            meeting={meeting}
            seat={seats.get(meeting.id) ?? { lane: 0, lanes: 1 }}
            space={spaces.find((row) => row.id === meeting.spaceId)}
            me={me}
            compact={compact}
            onOpen={onOpen}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {now !== null && (
          <div
            style={{ top: `${now}%` }}
            className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
            <span className="h-px flex-1 bg-danger" />
          </div>
        )}

        {dragged && (
          <div
            className="absolute inset-0 z-40"
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setPreview(clockFrom(event.clientY));
            }}
            onDragLeave={() => setPreview(null)}
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData('text/plain');
              const target = !id || dragged.id === id ? dragged : null;
              const start = clockFrom(event.clientY);
              setPreview(null);
              if (target && (target.date !== date || target.start !== start)) {
                onDrop(target, date, start);
              }
            }}
          >
            {preview && (
              <div
                style={{ top: `${((toMinutes(preview) - OPENS) / DAY_MINUTES) * 100}%` }}
                className="pointer-events-none absolute inset-x-0 flex items-center gap-1"
              >
                <span className="rounded bg-brand-700 px-1 py-0.5 text-[0.5625rem] font-medium tabular-nums text-nt-0">
                  {preview}
                </span>
                <span className="h-0.5 flex-1 rounded-full bg-brand-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
