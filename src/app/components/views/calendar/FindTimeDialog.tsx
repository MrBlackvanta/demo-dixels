import { useMemo, useState } from 'react';
import { CalendarSearch, Check, MapPin, SearchX, Video, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { duration, initials, todayKey } from '../../../lib/format';
import { LENGTHS, openSlots, relativeDay, tightestOf } from '../../../lib/agenda';
import type { Slot } from '../../../lib/agenda';
import type { Booking, Meeting, Space } from '../../../lib/data';
import { seats } from './dayplan';

const HORIZON = 10;

interface FindTimeDialogProps {
  all: Meeting[];
  bookings: Booking[];
  spaces: Space[];
  people: string[];
  me: string;
  onClose: () => void;
  onPick: (slot: Slot, guests: string[], length: number) => void;
}

export function FindTimeDialog({
  all,
  bookings,
  spaces,
  people,
  me,
  onClose,
  onPick,
}: FindTimeDialogProps) {
  const [guests, setGuests] = useState<string[]>([]);
  const [length, setLength] = useState(60);
  const [needsRoom, setNeedsRoom] = useState(true);

  const attendees = useMemo(() => [me, ...guests], [me, guests]);

  const slots = useMemo(
    () =>
      openSlots(
        all,
        spaces,
        bookings,
        todayKey(),
        {
          people: attendees,
          length,
          days: HORIZON,
          headcount: attendees.length,
          needsRoom,
        },
        6,
      ),
    [all, spaces, bookings, attendees, length, needsRoom],
  );

  const tightest = useMemo(
    () => (slots.length === 0 ? tightestOf(all, attendees, todayKey(), length, HORIZON) : undefined),
    [slots.length, all, attendees, length],
  );

  const toggle = (person: string) =>
    setGuests((current) =>
      current.includes(person)
        ? current.filter((name) => name !== person)
        : [...current, person],
    );

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">My Calendar</p>
            <h2 className="dx-h4">Find a time that works</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              Every window in the next {HORIZON} days where all of you are free, and a room is too.
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
          <fieldset>
            <legend className="dx-eyebrow mb-1.5">
              Who needs to be there — {attendees.length}
            </legend>
            <div className="max-h-44 overflow-y-auto rounded-md border border-line p-2">
              <div className="flex flex-wrap gap-1.5">
                {people
                  .filter((person) => person !== me)
                  .map((person) => {
                    const picked = guests.includes(person);
                    return (
                      <button
                        key={person}
                        type="button"
                        onClick={() => toggle(person)}
                        aria-pressed={picked}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.75rem] transition-all duration-[180ms]',
                          picked
                            ? 'border-brand-300 bg-brand-50 text-brand-700'
                            : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                        )}
                      >
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-nt-100 text-[0.5rem] font-medium text-ink-muted">
                          {initials(person)}
                        </span>
                        {person}
                        {picked && <Check size={11} aria-hidden="true" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="find-length" className="dx-eyebrow mb-1.5 block">
                How long
              </label>
              <select
                id="find-length"
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
                data-autofocus
                className="dx-field"
              >
                {LENGTHS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {duration(minutes)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2.5 text-[0.8125rem] text-ink">
                <input
                  type="checkbox"
                  checked={needsRoom}
                  onChange={(event) => setNeedsRoom(event.target.checked)}
                  className="h-4 w-4 rounded border-line-strong accent-brand-600"
                />
                It needs a room
              </label>
            </div>
          </div>

          <section aria-live="polite" aria-label="Times that work">
            <h3 className="dx-eyebrow mb-2">
              {slots.length > 0 ? `${slots.length} windows work` : 'Nothing works'}
            </h3>

            {slots.length === 0 ? (
              <div className="rounded-lg border border-line bg-nt-50 px-4 py-5 text-center">
                <SearchX size={20} aria-hidden="true" className="mx-auto mb-2 text-ink-subtle" />
                <p className="text-[0.875rem] text-ink">
                  No {duration(length)} window in the next {HORIZON} days.
                </p>
                {tightest && (
                  <p className="mt-1.5 text-[0.75rem] text-ink-muted">
                    {tightest} is the hardest to fit — their calendar blocks the most of them.
                  </p>
                )}
                <p className="mt-1.5 text-[0.75rem] text-ink-muted">
                  Try a shorter meeting{needsRoom && ', or drop the room requirement'}.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot) => (
                  <li key={`${slot.date}-${slot.start}`}>
                    <button
                      type="button"
                      onClick={() => onPick(slot, guests, length)}
                      className="flex w-full items-center gap-3 rounded-lg border border-line px-4 py-3 text-left transition-all duration-[140ms] hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50 hover:shadow-raise"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.875rem] font-medium text-ink">
                          {relativeDay(slot.date)}, {slot.start}–{slot.end}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                          {slot.space ? (
                            <>
                              <MapPin size={11} aria-hidden="true" />
                              {slot.space.name} · {seats(slot.space.capacity)}
                            </>
                          ) : (
                            <>
                              <Video size={11} aria-hidden="true" />
                              Online
                            </>
                          )}
                          <span>· all {attendees.length} free</span>
                        </span>
                      </span>
                      <CalendarSearch
                        size={15}
                        aria-hidden="true"
                        className="shrink-0 text-ink-subtle"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-nt-0 px-6 py-4">
          <p className="text-[0.75rem] text-ink-muted">
            Pick one and it opens the form with everything filled in.
          </p>
          <button type="button" onClick={onClose} className="dx-btn-ghost">
            Close
          </button>
        </footer>
      </div>
    </Modal>
  );
}
