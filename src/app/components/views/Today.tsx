import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Check,
  Coffee,
  MapPin,
  Sparkles,
  Thermometer,
  UserPlus,
  Users,
} from 'lucide-react';
import { CountUp } from '../shell/CountUp';
import { cn } from '../ui/utils';
import { useCollection } from '../../lib/store';
import {
  CURRENT_USER,
  meetings as meetingsCol,
  orders as ordersCol,
  tasks as tasksCol,
  tickets as ticketsCol,
  visits as visitsCol,
} from '../../lib/data';
import type { Meeting } from '../../lib/data';

const timeOfDay = (hour: number): string => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

function useNextMeeting(meetings: Meeting[]): { meeting?: Meeting; minutesAway: number } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const upcoming = [...meetings]
    .filter((item) => new Date(item.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const meeting = upcoming[0];
  const minutesAway = meeting
    ? Math.round((new Date(meeting.start).getTime() - now) / 60_000)
    : 0;

  return { meeting, minutesAway };
}

export function Today() {
  const navigate = useNavigate();
  const meetings = useCollection(meetingsCol);
  const visits = useCollection(visitsCol);
  const orders = useCollection(ordersCol);
  const tickets = useCollection(ticketsCol);
  const tasks = useCollection(tasksCol);

  const { meeting, minutesAway } = useNextMeeting(meetings);
  const greeting = timeOfDay(new Date().getHours());
  const weekday = new Date().toLocaleDateString([], { weekday: 'long' });

  const openTasks = tasks.filter((task) => !task.done);
  const expectedGuests = visits.filter((visit) => visit.status !== 'checked-out');
  const liveOrder = orders.find((order) => order.status !== 'delivered');

  const stats = [
    { label: 'Meetings today', value: meetings.length, tone: 'brand' as const },
    { label: 'Guests expected', value: expectedGuests.length, tone: 'green' as const },
    { label: 'Open tasks', value: openTasks.length, tone: 'neutral' as const },
    { label: 'Tickets in flight', value: tickets.filter((t) => t.status !== 'resolved').length, tone: 'neutral' as const },
  ];

  return (
    <div className="relative">
      <div className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70" aria-hidden="true" />

      <div className="relative mx-auto max-w-[76rem] px-6 py-8">
        <header className="mb-8">
          <p className="dx-eyebrow mb-2">
            {weekday} · {CURRENT_USER.building}
          </p>
          <h2 className="dx-h2 text-balance">
            {greeting}, {CURRENT_USER.name.split(' ')[0]}.
          </h2>
          <p className="mt-2 text-body-lg text-ink-muted">Everything you need for the day ahead.</p>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <section aria-labelledby="next-heading" className="dx-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-6 py-3.5">
              <h3 id="next-heading" className="dx-eyebrow">
                Your next meeting
              </h3>
              {meeting && minutesAway > 0 && (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-medium text-brand-700">
                  in {minutesAway} min
                </span>
              )}
            </div>

            {meeting ? (
              <div className="px-6 py-6">
                <h4 className="dx-h3 mb-1.5">{meeting.title}</h4>
                <p className="mb-5 text-body text-ink-muted">
                  {clock(meeting.start)} – {clock(meeting.end)} · {meeting.space} · {meeting.level}
                </p>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {meeting.attendees.map((initials) => (
                      <span
                        key={initials}
                        className="grid h-8 w-8 place-items-center rounded-full border-2 border-nt-0 bg-brand-100 text-[0.625rem] font-medium text-brand-700"
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <span className="text-[0.8125rem] text-ink-muted">
                    You + {meeting.attendees.length - 1} people
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button type="button" onClick={() => navigate('/atmosphere')} className="dx-btn-primary">
                    <Thermometer size={15} aria-hidden="true" />
                    Prepare the room
                  </button>
                  <button type="button" onClick={() => navigate('/pathfinder')} className="dx-btn-secondary">
                    <MapPin size={15} aria-hidden="true" />
                    Find my way
                  </button>
                </div>
              </div>
            ) : (
              <p className="px-6 py-10 text-center text-body text-ink-muted">
                Nothing left on your calendar today.
              </p>
            )}
          </section>

          <section aria-labelledby="cortex-heading" className="relative overflow-hidden rounded-lg p-6 text-nt-0">
            <div className="dx-wash-deep absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={15} aria-hidden="true" />
                <h3 id="cortex-heading" className="text-[0.6875rem] font-medium uppercase tracking-[0.16em]">
                  Cortex
                </h3>
              </div>

              <p className="mb-5 text-[1.0625rem] leading-snug tracking-[-0.02em]">
                Layla arrives at 13:00. I can get everything ready.
              </p>

              <ul className="mb-6 space-y-2.5">
                {[
                  { label: 'Orchid held for the review', product: 'SpaceOS' },
                  { label: 'Parking bay reserved', product: 'ParkFlow' },
                  { label: 'Coffee for two, on arrival', product: 'Nourish' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-2.5 text-[0.8125rem]">
                    <Check size={14} className="mt-0.5 shrink-0 text-brand-100" aria-hidden="true" />
                    <span>
                      {item.label}
                      <span className="ml-1.5 text-[0.6875rem] text-brand-100">{item.product}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => navigate('/cortex')}
                className="inline-flex items-center gap-2 rounded-md bg-nt-0/15 px-3.5 py-2 text-[0.8125rem] font-medium backdrop-blur-sm transition-colors duration-[180ms] hover:bg-nt-0/25"
              >
                Review the plan
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>

        <section aria-label="Today at a glance" className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <section aria-labelledby="day-heading" className="dx-card overflow-hidden">
            <div className="border-b border-line px-6 py-3.5">
              <h3 id="day-heading" className="dx-eyebrow">
                Your day
              </h3>
            </div>
            <ul className="divide-y divide-line">
              {meetings.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-12 shrink-0 text-[0.8125rem] font-medium tabular-nums text-ink">
                    {clock(item.start)}
                  </span>
                  <span
                    className={cn(
                      'h-9 w-0.5 shrink-0 rounded-full',
                      item.status === 'confirmed' ? 'bg-brand-400' : 'bg-line-strong',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium text-ink">
                      {item.title}
                    </span>
                    <span className="block truncate text-[0.75rem] text-ink-muted">
                      {item.space} · {item.level}
                    </span>
                  </span>
                  {item.status === 'tentative' && (
                    <span className="shrink-0 rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] text-ink-muted">
                      Tentative
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-5">
            <section aria-labelledby="actions-heading" className="dx-card p-5">
              <h3 id="actions-heading" className="dx-eyebrow mb-4">
                Quick actions
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Coffee', icon: Coffee, path: '/nourish' },
                  { label: 'Guest', icon: UserPlus, path: '/visitflow' },
                  { label: 'Space', icon: Users, path: '/spaceos' },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group flex flex-col items-center gap-2 rounded-sm border border-line bg-nt-0 px-2 py-3.5 transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise"
                  >
                    <action.icon
                      size={17}
                      strokeWidth={1.8}
                      className="text-ink-muted transition-colors group-hover:text-brand-600"
                      aria-hidden="true"
                    />
                    <span className="text-[0.75rem] font-medium text-ink">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {liveOrder && (
              <section aria-label="Order in progress" className="dx-card flex items-center gap-3.5 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grn-50 text-grn-600">
                  <Coffee size={17} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.875rem] font-medium text-ink">
                    {liveOrder.item}
                  </span>
                  <span className="block truncate text-[0.75rem] text-ink-muted">
                    {liveOrder.options} · to {liveOrder.destination}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-grn-50 px-2.5 py-1 text-[0.6875rem] font-medium text-grn-600">
                  On the way
                </span>
              </section>
            )}

            <section aria-labelledby="tasks-heading" className="dx-card overflow-hidden">
              <div className="border-b border-line px-5 py-3.5">
                <h3 id="tasks-heading" className="dx-eyebrow">
                  Needs you
                </h3>
              </div>
              <ul className="divide-y divide-line">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => tasksCol.update(task.id, { done: !task.done })}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-[180ms] hover:bg-nt-50"
                      aria-pressed={task.done}
                    >
                      <span
                        className={cn(
                          'grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full border transition-colors duration-[180ms]',
                          task.done
                            ? 'border-brand-600 bg-brand-600 text-nt-0'
                            : 'border-line-strong bg-nt-0',
                        )}
                      >
                        {task.done && <Check size={11} strokeWidth={3} aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-[0.8125rem] transition-colors',
                            task.done ? 'text-ink-subtle line-through' : 'text-ink',
                          )}
                        >
                          {task.title}
                        </span>
                        <span className="block truncate text-[0.6875rem] text-ink-subtle">
                          {task.due}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
