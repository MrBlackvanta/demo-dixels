import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarX,
  Check,
  CircleHelp,
  Link2,
  MapPin,
  Repeat,
  Users,
  Video,
  X,
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { duration, initials } from '../../../lib/format';
import {
  answerOf,
  clashesFor,
  isOnInvite,
  lengthOf,
  openSlots,
  relativeDay,
  roomHolder,
  tally,
} from '../../../lib/agenda';
import { remainingOf } from '../../../lib/workload';
import type { Booking, Meeting, Rsvp, Space, Task } from '../../../lib/data';
import { KIND_LABEL, KIND_TONE, RSVP_ICON, RSVP_LABEL, RSVP_TONE, seats } from './dayplan';

const ANSWERS: Rsvp[] = ['yes', 'maybe', 'no'];

interface MeetingSheetProps {
  meeting: Meeting;
  all: Meeting[];
  bookings: Booking[];
  spaces: Space[];
  tasks: Task[];
  me: string;
  onClose: () => void;
  onAnswer: (meeting: Meeting, answer: Rsvp) => void;
  onRoom: (meeting: Meeting, spaceId: string) => void;
  onMove: (meeting: Meeting, date: string, start: string) => void;
  onCancel: (meeting: Meeting) => void;
}

export function MeetingSheet({
  meeting,
  all,
  bookings,
  spaces,
  tasks,
  me,
  onClose,
  onAnswer,
  onRoom,
  onMove,
  onCancel,
}: MeetingSheetProps) {
  const [moving, setMoving] = useState(false);

  const mine = meeting.organizer === me;
  const invited = isOnInvite(meeting, me);
  const answer = answerOf(meeting, me);
  const minutes = lengthOf(meeting);
  const space = spaces.find((row) => row.id === meeting.spaceId);
  const counts = tally(meeting);
  const task = tasks.find((row) => row.id === meeting.taskId);

  const clashes = clashesFor(all, [me], meeting.date, meeting.start, meeting.end, meeting.id);

  const rooms = useMemo(
    () =>
      spaces
        .filter((row) => !row.offline && row.kind !== 'Desk')
        .map((row) => ({
          space: row,
          holder: roomHolder(
            bookings,
            row.id,
            meeting.date,
            meeting.start,
            meeting.end,
            meeting.bookingId,
          ),
        }))
        .sort((a, b) => a.space.capacity - b.space.capacity || a.space.name.localeCompare(b.space.name)),
    [spaces, bookings, meeting.date, meeting.start, meeting.end, meeting.bookingId],
  );

  const headcount = meeting.invitees.length + 1;

  const slots = useMemo(
    () =>
      moving
        ? openSlots(
            all,
            spaces,
            bookings,
            meeting.date,
            {
              people: [meeting.organizer, ...meeting.invitees.filter((g) => !g.optional).map((g) => g.name)],
              length: minutes,
              days: 5,
              headcount,
              needsRoom: meeting.spaceId !== undefined,
            },
            4,
          )
        : [],
    [moving, all, spaces, bookings, meeting, minutes, headcount],
  );

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl">
        <header className="shrink-0 border-b border-line bg-nt-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="dx-eyebrow mb-1.5">
                {relativeDay(meeting.date)} · {meeting.start}–{meeting.end} ·{' '}
                {duration(minutes)}
              </p>
              <h2 className="dx-h4 text-balance">{meeting.title}</h2>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">{meeting.agenda}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="dx-btn-ghost -mr-2 -mt-1 shrink-0"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium',
                KIND_TONE[meeting.kind],
              )}
            >
              {KIND_LABEL[meeting.kind]}
            </span>

            {meeting.status === 'cancelled' && (
              <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[0.6875rem] font-medium text-danger">
                Cancelled
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-muted">
              {space ? (
                <>
                  <MapPin size={10} aria-hidden="true" />
                  {space.name} · {space.level}
                </>
              ) : (
                <>
                  <Video size={10} aria-hidden="true" />
                  {meeting.place ?? 'Online'}
                </>
              )}
            </span>

            {meeting.repeats && (
              <span className="inline-flex items-center gap-1 rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-muted">
                <Repeat size={10} aria-hidden="true" />
                {meeting.repeats}
              </span>
            )}

            {meeting.origin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] text-brand-700">
                <Link2 size={10} aria-hidden="true" />
                {meeting.origin.module} · {meeting.origin.ref}
              </span>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1fr_17rem]">
            <div className="space-y-5 px-6 py-5">
              {clashes.length > 0 && (
                <section
                  aria-label="Clash with another entry"
                  className="rounded-lg border border-warning/40 bg-warning-bg px-4 py-3"
                >
                  <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-warning">
                    <AlertTriangle size={13} aria-hidden="true" className="shrink-0" />
                    This runs over {clashes.length === 1 ? 'another entry' : `${clashes.length} other entries`}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-[0.75rem] text-ink-muted">
                    {clashes.map(({ meeting: other }) => (
                      <li key={other.id}>
                        {other.start}–{other.end} · {other.title}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {invited && !mine && meeting.status !== 'cancelled' && (
                <section aria-labelledby="rsvp-heading">
                  <h3 id="rsvp-heading" className="dx-eyebrow mb-2">
                    Are you going?
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ANSWERS.map((option) => {
                      const Icon = RSVP_ICON[option];
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onAnswer(meeting, option)}
                          aria-pressed={answer === option}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                            answer === option
                              ? 'border-ink bg-ink font-medium text-nt-0'
                              : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                          )}
                        >
                          <Icon size={13} aria-hidden="true" />
                          {RSVP_LABEL[option]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[0.75rem] text-ink-muted">
                    {answer === 'no'
                      ? 'You said no, so this time counts as free on your calendar.'
                      : 'Saying no gives the time back to your day.'}
                  </p>
                </section>
              )}

              <section aria-labelledby="who-heading">
                <h3 id="who-heading" className="dx-eyebrow mb-2.5">
                  Who is coming — {counts.yes} of {headcount}
                </h3>

                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-[0.625rem] font-medium text-brand-700">
                      {initials(meeting.organizer)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">
                      {meeting.organizer === me ? 'You' : meeting.organizer}
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] font-medium text-brand-700">
                      Organiser
                    </span>
                  </li>

                  {meeting.invitees.map((guest) => (
                    <li key={guest.name} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.625rem] font-medium',
                          guest.answer === 'no'
                            ? 'bg-nt-100 text-ink-subtle'
                            : 'bg-nt-100 text-ink-muted',
                        )}
                      >
                        {initials(guest.name)}
                      </span>
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-[0.8125rem]',
                          guest.answer === 'no' ? 'text-ink-subtle line-through' : 'text-ink',
                        )}
                      >
                        {guest.name === me ? 'You' : guest.name}
                        {guest.optional && (
                          <span className="ml-1.5 text-[0.6875rem] text-ink-subtle">optional</span>
                        )}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
                          RSVP_TONE[guest.answer],
                        )}
                      >
                        {RSVP_LABEL[guest.answer]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {task && (
                <section
                  aria-label="The task this protects"
                  className="rounded-lg border border-line bg-nt-50 px-4 py-3"
                >
                  <p className="text-[0.8125rem] font-medium text-ink">{task.title}</p>
                  <p className="mt-1 text-[0.75rem] text-ink-muted">
                    {task.ref} · {duration(remainingOf(task))} still to do of{' '}
                    {duration(task.estimate)}
                    {minutes < remainingOf(task) &&
                      ` — this block covers ${duration(minutes)} of it.`}
                  </p>
                </section>
              )}
            </div>

            <aside className="space-y-5 border-t border-line px-6 py-5 lg:border-l lg:border-t-0">
              {mine && meeting.status !== 'cancelled' && (
                <section aria-labelledby="room-heading">
                  <h3 id="room-heading" className="dx-eyebrow mb-2">
                    Room
                  </h3>
                  <label htmlFor="sheet-room" className="sr-only">
                    Move it to another room
                  </label>
                  <select
                    id="sheet-room"
                    value={meeting.spaceId ?? ''}
                    onChange={(event) => onRoom(meeting, event.target.value)}
                    className="dx-field"
                  >
                    <option value="">No room — online</option>
                    {rooms.map(({ space: row, holder }) => (
                      <option key={row.id} value={row.id} disabled={holder !== undefined}>
                        {row.name} · {seats(row.capacity)}
                        {holder ? ` — taken by ${holder.organizer}` : ''}
                        {!holder && row.capacity < headcount ? ' — too small' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[0.6875rem] text-ink-muted">
                    {rooms.filter(({ holder }) => holder === undefined).length} of {rooms.length}{' '}
                    rooms are free at this time.
                  </p>
                </section>
              )}

              {mine && meeting.status !== 'cancelled' && (
                <section aria-labelledby="move-heading">
                  <h3 id="move-heading" className="dx-eyebrow mb-2">
                    Move it
                  </h3>

                  {!moving ? (
                    <button
                      type="button"
                      onClick={() => setMoving(true)}
                      className="dx-btn-secondary w-full"
                    >
                      <Users size={14} aria-hidden="true" />
                      Find a time that works
                    </button>
                  ) : slots.length === 0 ? (
                    <p className="text-[0.75rem] text-ink-muted">
                      No window in the next five days where everyone is free.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {slots.map((slot) => (
                        <li key={`${slot.date}-${slot.start}`}>
                          <button
                            type="button"
                            onClick={() => onMove(meeting, slot.date, slot.start)}
                            className="w-full rounded-md border border-line px-3 py-2 text-left transition-colors duration-[140ms] hover:border-brand-300 hover:bg-brand-50"
                          >
                            <span className="block text-[0.8125rem] text-ink">
                              {relativeDay(slot.date)}, {slot.start}
                            </span>
                            <span className="block text-[0.6875rem] text-ink-muted">
                              {slot.space ? slot.space.name : 'Online'} · everyone free
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <section aria-labelledby="stats-heading">
                <h3 id="stats-heading" className="dx-eyebrow mb-2">
                  Answers
                </h3>
                <dl className="space-y-1.5 text-[0.75rem]">
                  {(['yes', 'maybe', 'no', 'pending'] as Rsvp[]).map((state) => (
                    <div key={state} className="flex items-center justify-between gap-2">
                      <dt className="text-ink-muted">{RSVP_LABEL[state]}</dt>
                      <dd className="tabular-nums text-ink">{counts[state]}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {mine && meeting.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => onCancel(meeting)}
                  className="dx-btn-secondary w-full border-danger/40 text-danger hover:bg-danger-bg"
                >
                  <CalendarX size={14} aria-hidden="true" />
                  Cancel the meeting
                </button>
              )}

              {!mine && !invited && (
                <p className="flex items-start gap-2 text-[0.75rem] text-ink-muted">
                  <CircleHelp size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                  You are not on this one. You can see it because you are looking at the whole
                  building.
                </p>
              )}

              {answer === 'yes' && !mine && (
                <p className="flex items-start gap-2 text-[0.75rem] text-grn-700">
                  <Check size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                  You are going. It is holding {duration(minutes)} of your day.
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Modal>
  );
}
