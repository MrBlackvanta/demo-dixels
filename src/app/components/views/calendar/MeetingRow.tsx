import { Link2, MapPin, Repeat, Users, Video } from 'lucide-react';
import { cn } from '../../ui/utils';
import { duration } from '../../../lib/format';
import { answerOf, isOptionalFor, lengthOf } from '../../../lib/agenda';
import type { Meeting, Space } from '../../../lib/data';
import { KIND_EDGE, KIND_LABEL, RSVP_TONE } from './dayplan';

interface MeetingRowProps {
  meeting: Meeting;
  space?: Space;
  me: string;
  clashing?: boolean;
  onOpen: (meeting: Meeting) => void;
}

export function MeetingRow({ meeting, space, me, clashing = false, onOpen }: MeetingRowProps) {
  const answer = answerOf(meeting, me);
  const mine = meeting.organizer === me;
  const where = space ? `${space.name} · ${space.level}` : (meeting.place ?? 'Online');

  return (
    <button
      type="button"
      onClick={() => onOpen(meeting)}
      className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-[140ms] hover:bg-nt-50"
    >
      <span className="w-[3.25rem] shrink-0 text-right">
        <span className="block text-[0.8125rem] font-medium tabular-nums text-ink">
          {meeting.start}
        </span>
        <span className="block text-[0.625rem] tabular-nums text-ink-subtle">
          {duration(lengthOf(meeting))}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'h-9 w-0.5 shrink-0 rounded-full',
          KIND_EDGE[meeting.kind],
          answer === 'no' && 'opacity-30',
        )}
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'truncate text-[0.875rem] text-ink',
              answer === 'no' && 'text-ink-subtle line-through',
            )}
          >
            {meeting.title}
          </span>
          {meeting.repeats && (
            <Repeat size={11} aria-hidden="true" className="shrink-0 text-ink-subtle" />
          )}
          {meeting.origin && (
            <Link2 size={11} aria-hidden="true" className="shrink-0 text-brand-600" />
          )}
        </span>

        <span className="mt-0.5 flex items-center gap-2 text-[0.6875rem] text-ink-muted">
          {space ? (
            <MapPin size={10} aria-hidden="true" className="shrink-0" />
          ) : (
            <Video size={10} aria-hidden="true" className="shrink-0" />
          )}
          <span className="truncate">{where}</span>
          {meeting.invitees.length > 0 && (
            <>
              <Users size={10} aria-hidden="true" className="shrink-0" />
              <span className="tabular-nums">{meeting.invitees.length + 1}</span>
            </>
          )}
          <span className="truncate text-ink-subtle">
            {mine ? 'You organised it' : meeting.organizer}
          </span>
        </span>
      </span>

      {clashing && (
        <span className="shrink-0 rounded-full bg-warning-bg px-2 py-0.5 text-[0.625rem] font-medium text-warning">
          Clash
        </span>
      )}

      {isOptionalFor(meeting, me) && !clashing && (
        <span className="hidden shrink-0 rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] text-ink-muted sm:inline">
          Optional
        </span>
      )}

      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
          mine ? 'bg-brand-50 text-brand-700' : RSVP_TONE[answer],
        )}
      >
        {mine ? 'Host' : KIND_LABEL[meeting.kind]}
      </span>
    </button>
  );
}
