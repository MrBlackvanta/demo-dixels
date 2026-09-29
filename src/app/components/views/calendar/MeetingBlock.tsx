import { Link2, MapPin, Users, Video } from 'lucide-react';
import { cn } from '../../ui/utils';
import { answerOf, lengthOf, placeOf } from '../../../lib/agenda';
import type { Lane } from '../../../lib/agenda';
import type { Meeting, Space } from '../../../lib/data';
import { KIND_EDGE, KIND_TONE } from './dayplan';

interface MeetingBlockProps {
  meeting: Meeting;
  seat: Lane;
  space?: Space;
  me: string;
  compact?: boolean;
  onOpen: (meeting: Meeting) => void;
  onDragStart: (meeting: Meeting) => void;
  onDragEnd: () => void;
}

export function MeetingBlock({
  meeting,
  seat,
  space,
  me,
  compact = false,
  onOpen,
  onDragStart,
  onDragEnd,
}: MeetingBlockProps) {
  const { top, height } = placeOf(meeting);
  const { lane, lanes } = seat;
  const answer = answerOf(meeting, me);
  const declined = answer === 'no';
  const minutes = lengthOf(meeting);
  const tight = minutes <= 30;

  const width = 100 / lanes;

  return (
    <button
      type="button"
      draggable={meeting.status !== 'cancelled'}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', meeting.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart(meeting);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(meeting)}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        left: `${lane * width}%`,
        width: `calc(${width}% - 0.25rem)`,
      }}
      className={cn(
        'absolute overflow-hidden rounded-md border pl-2.5 pr-1.5 text-left transition-all duration-[140ms]',
        'hover:z-20 hover:shadow-raise focus-visible:z-20',
        tight ? 'py-0.5' : 'py-1',
        KIND_TONE[meeting.kind],
        declined && 'opacity-45 saturate-50',
        meeting.status === 'cancelled' && 'line-through opacity-40',
      )}
      title={`${meeting.start}–${meeting.end} · ${meeting.title}`}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-y-0 left-0 w-[3px]', KIND_EDGE[meeting.kind])}
      />

      <span className="block truncate text-[0.6875rem] font-medium leading-tight">
        {meeting.title}
      </span>

      {!tight && (
        <span className="mt-0.5 flex items-center gap-1 truncate text-[0.625rem] opacity-80">
          <span className="tabular-nums">{meeting.start}</span>
          {!compact && space && (
            <>
              <MapPin size={9} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{space.name}</span>
            </>
          )}
          {!compact && !space && meeting.online && (
            <>
              <Video size={9} aria-hidden="true" className="shrink-0" />
              <span className="truncate">Online</span>
            </>
          )}
          {!compact && meeting.invitees.length > 0 && (
            <>
              <Users size={9} aria-hidden="true" className="shrink-0" />
              <span className="tabular-nums">{meeting.invitees.length + 1}</span>
            </>
          )}
          {!compact && meeting.origin && <Link2 size={9} aria-hidden="true" className="shrink-0" />}
        </span>
      )}

      {declined && <span className="sr-only">You declined this</span>}
    </button>
  );
}
