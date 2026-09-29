import { cn } from '../../ui/utils';
import { todayKey } from '../../../lib/format';
import { busyMinutes, byStart, clashesFor, relativeDay } from '../../../lib/agenda';
import type { Meeting, Space } from '../../../lib/data';
import { MeetingRow } from './MeetingRow';

interface AgendaListProps {
  days: string[];
  meetings: Meeting[];
  spaces: Space[];
  me: string;
  onOpen: (meeting: Meeting) => void;
}

export function AgendaList({ days, meetings, spaces, me, onOpen }: AgendaListProps) {
  const filled = days
    .map((date) => ({
      date,
      rows: meetings.filter((meeting) => meeting.date === date).sort(byStart),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <div className="divide-y divide-line">
      {filled.map(({ date, rows }) => {
        const load = busyMinutes(meetings, me, date);

        return (
          <section key={date} aria-label={relativeDay(date)}>
            <div
              className={cn(
                'flex items-center justify-between gap-3 border-b border-line px-5 py-2',
                date === todayKey() ? 'bg-brand-50' : 'bg-nt-50',
              )}
            >
              <h4
                className={cn(
                  'text-[0.75rem] font-medium',
                  date === todayKey() ? 'text-brand-700' : 'text-ink',
                )}
              >
                {relativeDay(date)}
              </h4>
              <span className="text-[0.6875rem] tabular-nums text-ink-muted">
                {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
                {load > 0 && ` · ${Math.round((load / 60) * 10) / 10}h booked`}
              </span>
            </div>

            <div className="divide-y divide-line">
              {rows.map((meeting) => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  space={spaces.find((row) => row.id === meeting.spaceId)}
                  me={me}
                  clashing={
                    clashesFor(meetings, [me], date, meeting.start, meeting.end, meeting.id).length >
                    0
                  }
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
