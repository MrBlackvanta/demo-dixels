import { useMemo, useState } from 'react';
import { AlertCircle, Check, Lock, Plus, Unlock, Users, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { addMinutes, duration, initials, todayKey } from '../../../lib/format';
import {
  LENGTHS,
  clashesFor,
  freeInWorkday,
  relativeDay,
  roomHolder,
  taskMinutesFor,
} from '../../../lib/agenda';
import type { Booking, Meeting, MeetingKind, Space, Task } from '../../../lib/data';
import { KIND_LABEL, seats } from './dayplan';

const KINDS: MeetingKind[] = ['meeting', 'focus', 'workshop', 'one-to-one', 'interview'];
const TITLE_MIN = 4;

export interface Draft {
  title: string;
  agenda: string;
  kind: MeetingKind;
  date: string;
  start: string;
  length: number;
  guests: string[];
  spaceId: string;
}

type Errors = Partial<Record<'title' | 'date' | 'room', string>>;

const FOCUS_ORDER: Array<keyof Errors> = ['title', 'date', 'room'];

interface NewMeetingDialogProps {
  seed: { date: string; start: string };
  all: Meeting[];
  bookings: Booking[];
  spaces: Space[];
  tasks: Task[];
  people: string[];
  me: string;
  onClose: () => void;
  onCreate: (draft: Draft) => void;
}

export function NewMeetingDialog({
  seed,
  all,
  bookings,
  spaces,
  tasks,
  people,
  me,
  onClose,
  onCreate,
}: NewMeetingDialogProps) {
  const [draft, setDraft] = useState<Draft>({
    title: '',
    agenda: '',
    kind: 'meeting',
    date: seed.date,
    start: seed.start,
    length: 60,
    guests: [],
    spaceId: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const end = addMinutes(draft.start, draft.length);
  const headcount = draft.guests.length + 1;

  const rooms = useMemo(
    () =>
      spaces
        .filter((row) => !row.offline && row.kind !== 'Desk')
        .map((row) => ({
          space: row,
          holder: roomHolder(bookings, row.id, draft.date, draft.start, end),
        }))
        .sort(
          (a, b) => a.space.capacity - b.space.capacity || a.space.name.localeCompare(b.space.name),
        ),
    [spaces, bookings, draft.date, draft.start, end],
  );

  const chosen = rooms.find(({ space }) => space.id === draft.spaceId);
  const roomTaken = chosen?.holder;
  const freeRooms = rooms.filter(({ holder }) => holder === undefined);

  const busyGuests = clashesFor(all, draft.guests, draft.date, draft.start, end);
  const myClash = clashesFor(all, [me], draft.date, draft.start, end);

  const freeBefore = freeInWorkday(all, me, draft.date);
  const needed = taskMinutesFor(tasks, me, draft.date);

  const freeAfter = useMemo(() => {
    const pencilled: Meeting = {
      id: '__draft',
      createdAt: '',
      updatedAt: '',
      title: draft.title,
      agenda: draft.agenda,
      kind: draft.kind,
      date: draft.date,
      start: draft.start,
      end,
      organizer: me,
      invitees: [],
      status: 'confirmed',
      online: draft.spaceId === '',
    };
    return freeInWorkday([...all, pencilled], me, draft.date);
  }, [all, draft, end, me]);

  const eatsWorkday = freeAfter < freeBefore;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const toggleGuest = (person: string) =>
    setDraft((current) => ({
      ...current,
      guests: current.guests.includes(person)
        ? current.guests.filter((name) => name !== person)
        : [...current.guests, person],
    }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.title.trim().length < TITLE_MIN)
      found.title = `Give it a title of at least ${TITLE_MIN} characters.`;
    if (!draft.date) found.date = 'Pick a day.';
    else if (draft.date < todayKey()) found.date = 'You cannot book a meeting in the past.';
    if (roomTaken)
      found.room = `${chosen?.space.name} is already held by ${roomTaken.organizer} from ${roomTaken.start} to ${roomTaken.end}.`;

    setErrors(found);

    const first = FOCUS_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(`meeting-${first}`)?.focus();
      return;
    }

    onCreate({ ...draft, title: draft.title.trim(), agenda: draft.agenda.trim() });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        noValidate
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">My Calendar</p>
            <h2 className="dx-h4">Put something in the day</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              The room has to be free. The people do not — but you will be told.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="dx-btn-ghost -mr-2 -mt-1 shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="meeting-title" className="dx-eyebrow mb-1.5 block">
              What is it
            </label>
            <input
              id="meeting-title"
              type="text"
              value={draft.title}
              onChange={(event) => set('title', event.target.value)}
              data-autofocus
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'meeting-title-error' : undefined}
              placeholder="Walk through the new form states"
              className={cn('dx-field', errors.title && 'border-danger')}
            />
            {errors.title && (
              <p
                id="meeting-title-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
              >
                <AlertCircle size={12} aria-hidden="true" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="meeting-agenda" className="dx-eyebrow mb-1.5 block">
              What people should come ready with
            </label>
            <textarea
              id="meeting-agenda"
              value={draft.agenda}
              onChange={(event) => set('agenda', event.target.value)}
              rows={2}
              placeholder="Optional — the reason this is not an email."
              className="dx-field resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="meeting-date" className="dx-eyebrow mb-1.5 block">
                Day
              </label>
              <input
                id="meeting-date"
                type="date"
                value={draft.date}
                min={todayKey()}
                onChange={(event) => set('date', event.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'meeting-date-error' : undefined}
                className={cn('dx-field', errors.date && 'border-danger')}
              />
              {errors.date && (
                <p
                  id="meeting-date-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
                >
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="meeting-start" className="dx-eyebrow mb-1.5 block">
                From
              </label>
              <input
                id="meeting-start"
                type="time"
                step={900}
                value={draft.start}
                onChange={(event) => set('start', event.target.value)}
                className="dx-field"
              />
            </div>

            <div>
              <label htmlFor="meeting-length" className="dx-eyebrow mb-1.5 block">
                For
              </label>
              <select
                id="meeting-length"
                value={draft.length}
                onChange={(event) => set('length', Number(event.target.value))}
                className="dx-field"
              >
                {LENGTHS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {duration(minutes)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="dx-eyebrow mb-1.5">What kind</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => set('kind', kind)}
                  aria-pressed={draft.kind === kind}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    draft.kind === kind
                      ? 'border-ink bg-ink font-medium text-nt-0'
                      : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                  )}
                >
                  {KIND_LABEL[kind]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="dx-eyebrow mb-1.5">
              Who else — {draft.guests.length} invited
            </legend>
            <div className="max-h-40 overflow-y-auto rounded-md border border-line p-2">
              <div className="flex flex-wrap gap-1.5">
                {people.map((person) => {
                  const picked = draft.guests.includes(person);
                  const busy = busyGuests.find((clash) => clash.person === person);

                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={() => toggleGuest(person)}
                      aria-pressed={picked}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] transition-all duration-[180ms]',
                        picked
                          ? busy
                            ? 'border-warning/50 bg-warning-bg text-warning'
                            : 'border-brand-300 bg-brand-50 text-brand-700'
                          : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                      )}
                    >
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-nt-100 text-[0.5rem] font-medium text-ink-muted">
                        {initials(person)}
                      </span>
                      {person}
                      {picked && busy && <span className="text-[0.625rem]">busy</span>}
                      {picked && !busy && <Check size={11} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor="meeting-room" className="dx-eyebrow mb-1.5 block">
              Where
            </label>
            <select
              id="meeting-room"
              value={draft.spaceId}
              onChange={(event) => {
                set('spaceId', event.target.value);
                setErrors((current) => ({ ...current, room: undefined }));
              }}
              aria-invalid={Boolean(errors.room)}
              aria-describedby={errors.room ? 'meeting-room-error' : undefined}
              className={cn('dx-field', errors.room && 'border-danger')}
            >
              <option value="">No room — online</option>
              {rooms.map(({ space, holder }) => (
                <option key={space.id} value={space.id} disabled={holder !== undefined}>
                  {space.name} · {space.level} · {seats(space.capacity)}
                  {holder ? ` — ${holder.organizer} has it` : ''}
                  {!holder && space.capacity < headcount ? ' — too small' : ''}
                </option>
              ))}
            </select>
            {errors.room && (
              <p
                id="meeting-room-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-danger"
              >
                <AlertCircle size={12} aria-hidden="true" />
                {errors.room}
              </p>
            )}
          </div>

          <section
            aria-label="What this does to the day"
            aria-live="polite"
            className={cn(
              'rounded-lg border px-4 py-3.5',
              busyGuests.length > 0 || myClash.length > 0
                ? 'border-warning/40 bg-warning-bg'
                : 'border-line bg-nt-50',
            )}
          >
            <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink">
              {busyGuests.length > 0 || myClash.length > 0 ? (
                <Lock size={13} aria-hidden="true" className="shrink-0 text-warning" />
              ) : (
                <Unlock size={13} aria-hidden="true" className="shrink-0 text-grn-600" />
              )}
              {busyGuests.length > 0
                ? busyGuests.length === 1
                  ? `${busyGuests[0].person.split(' ')[0]} is already in ${busyGuests[0].meeting.title}`
                  : `${busyGuests.length} of the people you picked are already busy`
                : myClash.length > 0
                  ? `This runs over your ${myClash[0].meeting.title}`
                  : 'Everybody you picked is free then'}
            </p>

            <p className="mt-1.5 text-[0.75rem] text-ink-muted">
              {relativeDay(draft.date)}, {draft.start}–{end} ·{' '}
              {chosen ? `${chosen.space.name}, ${seats(chosen.space.capacity)}` : 'online'} ·{' '}
              {headcount} {headcount === 1 ? 'person' : 'people'}
            </p>

            <p className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5 text-[0.75rem]">
              <Users size={12} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-subtle" />
              <span className={cn(needed > freeAfter ? 'font-medium text-warning' : 'text-ink-muted')}>
                {eatsWorkday
                  ? `Your open time goes from ${duration(freeBefore)} to ${duration(freeAfter)}, against ${duration(needed)} of task work`
                  : 'It falls outside the working day, so it does not eat your task time'}
                {eatsWorkday && needed > freeAfter && ' — that no longer fits'}
              </span>
            </p>

            {freeRooms.length > 0 && !chosen && (
              <p className="mt-1.5 text-[0.6875rem] text-ink-subtle">
                {freeRooms.length} rooms are free then if you want one.
              </p>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            <Plus size={14} aria-hidden="true" />
            Put it in
          </button>
        </footer>
      </form>
    </Modal>
  );
}
