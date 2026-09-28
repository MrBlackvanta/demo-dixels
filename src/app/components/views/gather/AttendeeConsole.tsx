import { useMemo, useState } from 'react';
import { CalendarOff, PartyPopper } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, events as eventsCol } from '../../../lib/data';
import { formatDay, todayKey } from '../../../lib/format';
import type { GatherEvent } from '../../../lib/data';
import { EventCard } from './EventCard';
import { EventSheet } from './EventSheet';
import { FeaturedEvent } from './FeaturedEvent';
import { MonthCalendar } from './MonthCalendar';
import { Toolbar } from './Toolbar';
import type { View } from './Toolbar';
import {
  NO_FILTERS,
  byWhen,
  isFull,
  isGoing,
  isPast,
  isWaiting,
  join,
  leave,
  matchesFilters,
  monthOf,
} from './events';
import type { Filters } from './events';

const me = CURRENT_USER.name;

export function AttendeeConsole() {
  const all = useCollection(eventsCol);

  const [view, setView] = useState<View>('browse');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [month, setMonth] = useState(() => monthOf(todayKey()));
  const [open, setOpen] = useState<GatherEvent | null>(null);

  const live = useMemo(() => all.filter((event) => event.status === 'published'), [all]);

  const upcoming = useMemo(() => live.filter((event) => !isPast(event)).sort(byWhen), [live]);

  const mine = useMemo(
    () => live.filter((event) => isGoing(event, me) || isWaiting(event, me)).sort(byWhen),
    [live],
  );

  const shown = useMemo(() => {
    const pool = view === 'mine' ? mine : upcoming;
    return pool.filter((event) => matchesFilters(event, filters));
  }, [view, mine, upcoming, filters]);

  const calendarEvents = useMemo(
    () => live.filter((event) => matchesFilters(event, filters)),
    [live, filters],
  );

  const today = todayKey();

  const stats = [
    {
      label: 'On your calendar',
      value: mine.filter((event) => !isPast(event)).length,
      tone: 'brand' as const,
    },
    {
      label: 'Happening today',
      value: live.filter((event) => event.date === today).length,
      tone: 'green' as const,
    },
    {
      label: 'Open to join',
      value: upcoming.filter((event) => !isGoing(event, me) && !isFull(event)).length,
      tone: 'neutral' as const,
    },
  ];

  const toggle = (event: GatherEvent) => {
    const current = eventsCol.find(event.id) ?? event;
    const leaving = isGoing(current, me) || isWaiting(current, me);
    const before = { going: current.going, waitlist: current.waitlist };
    const next = leaving ? leave(current, me) : join(current, me);

    eventsCol.update(current.id, next);
    setOpen((sheet) => (sheet && sheet.id === current.id ? { ...sheet, ...next } : sheet));

    const promoted =
      leaving && next.going && next.going.length === current.going.length
        ? next.going[next.going.length - 1]
        : null;

    toast.success(
      leaving
        ? `You are out of ${current.title}`
        : isFull(current)
          ? `You are on the waitlist for ${current.title}`
          : `You are going to ${current.title}`,
      {
        description: promoted
          ? `${promoted} takes your seat from the waitlist.`
          : `${formatDay(current.date)} · ${current.start} · ${current.location}`,
        action: {
          label: 'Undo',
          onClick: () => {
            eventsCol.update(current.id, before);
            setOpen((sheet) => (sheet && sheet.id === current.id ? { ...sheet, ...before } : sheet));
          },
        },
      },
    );
  };

  const featured = view === 'browse' && shown.length > 0 ? shown[0] : null;
  const rest = featured ? shown.slice(1) : shown;

  return (
    <>
      <div className="mb-7">
        <p className="dx-eyebrow mb-2">Gather · {CURRENT_USER.building}</p>
        <h2 className="dx-h2 text-balance">What is on around you</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
          Everything the building is running this month. One tap puts it in your day.
        </p>
      </div>

      <section aria-label="Your events at a glance" className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <CountUp
              value={stat.value}
              className={cn(
                'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'green' && 'text-grn-500',
                stat.tone === 'neutral' && 'text-ink',
              )}
            />
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="gather-heading" className="dx-card overflow-hidden">
        <h3 id="gather-heading" className="sr-only">
          Events
        </h3>

        <Toolbar
          view={view}
          onView={setView}
          filters={filters}
          onFilters={setFilters}
          mineCount={mine.filter((event) => !isPast(event)).length}
        />

        {view === 'calendar' ? (
          <MonthCalendar
            month={month}
            onMonth={setMonth}
            events={calendarEvents}
            me={me}
            onOpen={setOpen}
          />
        ) : shown.length === 0 ? (
          <div className="grid min-h-[16rem] place-items-center px-6 py-10 text-center">
            <div>
              {view === 'mine' ? (
                <PartyPopper size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
              ) : (
                <CalendarOff size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
              )}
              <p className="text-body text-ink">
                {view === 'mine'
                  ? 'Your diary is clear. Browse what is on and pick one.'
                  : 'Nothing matches that search yet.'}
              </p>
              <button
                type="button"
                onClick={() => (view === 'mine' ? setView('browse') : setFilters(NO_FILTERS))}
                className="dx-btn-secondary mt-3"
              >
                {view === 'mine' ? 'Browse events' : 'Clear the filters'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {featured && <FeaturedEvent event={featured} onOpen={setOpen} onToggle={toggle} />}

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  me={me}
                  onOpen={setOpen}
                  onToggle={toggle}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      {open && (
        <EventSheet event={open} me={me} onClose={() => setOpen(null)} onToggle={toggle} />
      )}
    </>
  );
}
