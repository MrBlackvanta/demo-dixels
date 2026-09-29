import { useEffect, useMemo, useState } from 'react';
import { Ban, CalendarClock, Building2, Compass, Plus, SearchX } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection, useScalar } from '../../../lib/store';
import {
  CURRENT_USER,
  closures as closuresCol,
  meetings as meetingsCol,
  places as placesCol,
  savedPlaces,
  spaces as spacesCol,
  standingAt,
  stepFreeOnly,
  tickets as ticketsCol,
} from '../../../lib/data';
import { toClock, todayKey, toMinutes } from '../../../lib/format';
import { dueFrom } from '../../../lib/sla';
import { byStart, isOnInvite, nowMinutes } from '../../../lib/agenda';
import {
  LEVELS,
  buildGraph,
  inForce,
  inRush,
  leaveBy,
  levelShort,
  placeForSpace,
  routeBetween,
  verdictOf,
  walkMinutes,
} from '../../../lib/wayfinding';
import type { Graph } from '../../../lib/wayfinding';
import type { Closure, Place } from '../../../lib/data';
import { ClosureDialog, blankClosure, draftFromClosure } from './ClosureDialog';
import type { ClosureDraft } from './ClosureDialog';
import { ClosureList } from './ClosureList';
import { DayList } from './DayList';
import type { Hop } from './DayList';
import { FloorList } from './FloorList';
import type { FloorRow } from './FloorList';
import { FloorPlan } from './FloorPlan';
import { PathRail } from './PathRail';
import type { NextStop } from './PathRail';
import { PlaceDialog, blankPlace, draftFromPlace } from './PlaceDialog';
import type { PlaceDraft } from './PlaceDialog';
import { ReportDialog, SYMPTOMS } from './ReportDialog';
import type { Symptom } from './ReportDialog';
import { RoutePanel } from './RoutePanel';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { NO_FILTERS, matchesFilters } from './wayfind';
import type { Filters } from './wayfind';

const me = CURRENT_USER.name;
const TICK_MS = 20000;

const LENSES: Lens[] = [
  { id: 'route', label: 'Find your way', icon: Compass },
  { id: 'floor', label: 'This floor', icon: Building2 },
  { id: 'day', label: 'Your day', icon: CalendarClock },
  { id: 'closures', label: 'Closures', icon: Ban },
];

export function Pathfinder() {
  const places = useCollection(placesCol);
  const closures = useCollection(closuresCol);
  const meetings = useCollection(meetingsCol);
  const spaces = useCollection(spacesCol);
  const tickets = useCollection(ticketsCol);

  const [here, setHere] = useScalar(standingAt);
  const [stepFree, setStepFree] = useScalar(stepFreeOnly);
  const [saved, setSaved] = useScalar(savedPlaces);

  const [lens, setLens] = useState('route');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [target, setTarget] = useState<string | null>(null);
  const [floor, setFloor] = useState('Level 4');
  const [reporting, setReporting] = useState(false);
  const [placeDraft, setPlaceDraft] = useState<{ draft: PlaceDraft; id?: string } | null>(null);
  const [closureDraft, setClosureDraft] = useState<{ draft: ClosureDraft; id?: string } | null>(
    null,
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((count) => count + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const today = todayKey();
  const clock = toClock(nowMinutes());

  const graphAt = useMemo(() => {
    const byRush = new Map<boolean, Graph>();
    return (at: string): Graph => {
      const busy = inRush(at);
      if (!byRush.has(busy)) {
        byRush.set(busy, buildGraph(places, closures, { stepFree, clock: at, date: today }));
      }
      return byRush.get(busy)!;
    };
  }, [places, closures, stepFree, today]);

  const graph = graphAt(clock);

  const live = useMemo(
    () => closures.filter((closure) => inForce(closure, today)),
    [closures, today],
  );

  const shut = useMemo(
    () => new Set(live.filter((closure) => closure.scope === 'place').map((row) => row.targetId)),
    [live],
  );

  const mine = useMemo(
    () =>
      meetings
        .filter(
          (meeting) =>
            meeting.date === today && meeting.status !== 'cancelled' && isOnInvite(meeting, me),
        )
        .sort(byStart),
    [meetings, today],
  );

  const from = places.find((place) => place.id === here) ?? places[0];

  const nextMeeting = useMemo(
    () =>
      mine.find(
        (meeting) =>
          meeting.spaceId !== undefined && toMinutes(meeting.start) > toMinutes(clock),
      ),
    [mine, clock],
  );

  const defaultTarget = placeForSpace(places, nextMeeting?.spaceId);
  const to = places.find((place) => place.id === target) ?? defaultTarget;

  const route = useMemo(
    () =>
      from === undefined || to === undefined
        ? {
            found: false,
            nodes: [],
            seconds: 0,
            metres: 0,
            climbs: 0,
            steps: [],
            stepFree,
            from,
            to,
          }
        : routeBetween(graph, places, from.id, to.id),
    [graph, places, from, to, stepFree],
  );

  const hops = useMemo<Hop[]>(() => {
    const rows = mine.map((meeting) => ({
      meeting,
      place: placeForSpace(places, meeting.spaceId),
    }));

    return rows.map((row, index) => {
      const after = rows[index + 1];
      if (after === undefined || row.place === undefined || after.place === undefined) return row;

      const gap = toMinutes(after.meeting.start) - toMinutes(row.meeting.end);
      if (gap < 0) return { ...row, gap, overlap: true };
      if (row.place.id === after.place.id) return { ...row, gap, sameRoom: true };

      const walk = routeBetween(graphAt(row.meeting.end), places, row.place.id, after.place.id);
      return {
        ...row,
        gap,
        route: walk,
        verdict: verdictOf(gap, walk),
        nextMeeting: after.meeting,
      };
    });
  }, [mine, places, graphAt]);

  const next = useMemo<NextStop | undefined>(() => {
    if (nextMeeting === undefined || from === undefined) return undefined;
    const place = placeForSpace(places, nextMeeting.spaceId);
    if (place === undefined || place.id === from.id) return undefined;

    const walk = routeBetween(graph, places, from.id, place.id);
    if (!walk.found) return undefined;

    const by = leaveBy(nextMeeting.start, walk);
    return {
      meeting: nextMeeting,
      place,
      route: walk,
      leaveBy: by,
      minutesLeft: by - toMinutes(clock),
    };
  }, [nextMeeting, from, places, graph, clock]);

  const showsCores = filters.kind === 'lift' || filters.kind === 'stairs';

  const rows = useMemo<FloorRow[]>(
    () =>
      places
        .filter((place) => place.level === floor)
        .filter((place) => showsCores || place.coreId === undefined)
        .filter((place) => matchesFilters(place, filters))
        .map((place) => ({
          place,
          space: spaces.find((space) => space.id === place.spaceId),
          route:
            from === undefined || place.id === from.id
              ? undefined
              : routeBetween(graph, places, from.id, place.id),
          closed: live.find(
            (closure) => closure.scope === 'place' && closure.targetId === place.id,
          )?.title,
        }))
        .sort((a, b) => a.place.name.localeCompare(b.place.name)),
    [places, floor, showsCores, filters, spaces, from, graph, live],
  );

  const impossible = hops.filter((hop) => hop.verdict === 'no').length;

  const stats = [
    { label: 'Places on the map', value: places.length, tone: 'brand' as const },
    { label: 'Floors you can walk', value: LEVELS.length, tone: 'neutral' as const },
    { label: 'Shut right now', value: live.length, tone: 'warning' as const },
    { label: 'Walks that do not fit today', value: impossible, tone: 'warning' as const },
  ];

  const goTo = (place: Place) => {
    setTarget(place.id);
    setFloor(place.level);
    setLens('route');
  };

  const start = (place: Place) => {
    setHere(place.id);
    toast.success(`You are at ${place.name}`, {
      description: `${place.level}. Every walk is measured from here now.`,
    });
  };

  const swap = () => {
    if (from === undefined || to === undefined) return;
    setHere(to.id);
    setTarget(from.id);
  };

  const toggleSave = () => {
    if (to === undefined) return;
    const on = saved.includes(to.id);
    setSaved(on ? saved.filter((id) => id !== to.id) : [...saved, to.id]);
    toast.success(on ? `${to.name} removed` : `${to.name} saved`, {
      description: on ? 'It is off your shortcuts.' : 'One tap away in the panel from now on.',
    });
  };

  const raise = (symptom: Symptom, detail: string) => {
    if (to === undefined) return;

    const openedAt = new Date().toISOString();
    const highest = tickets.reduce((top, row) => Math.max(top, Number(row.ref.slice(4)) || 0), 1039);

    const ticket = ticketsCol.create({
      ref: `RSV-${highest + 1}`,
      subject: `${symptom.label} — ${to.name}`,
      detail,
      category: symptom.category,
      team: symptom.team,
      location: `${to.name} · ${to.level}`,
      priority: symptom.priority,
      status: 'open',
      requester: me,
      openedAt,
      dueAt: dueFrom(openedAt, symptom.priority),
      spaceId: to.spaceId,
      thread: [
        { author: 'Resolve', body: `${me} raised this request`, at: openedAt, kind: 'event' },
        {
          author: 'Pathfinder',
          body: `Reported at ${to.name}, ${to.level}, ${to.x} across and ${to.y} down on the plan. ${
            to.stepFree ? 'Marked step-free.' : 'Marked as reachable by steps only.'
          }`,
          at: openedAt,
          kind: 'note',
        },
      ],
    });

    setReporting(false);
    toast.success(`${ticket.ref} is with the ${symptom.team} team`, {
      description: `${to.name} — they have the floor and the exact spot, so nobody has to describe it twice.`,
      action: { label: 'Undo', onClick: () => ticketsCol.remove(ticket.id) },
    });
  };

  const savePlace = (draft: PlaceDraft) => {
    const patch = {
      name: draft.name,
      kind: draft.kind,
      level: draft.level,
      x: draft.x,
      y: draft.y,
      stepFree: draft.stepFree,
      detail: draft.detail === '' ? undefined : draft.detail,
      hours: draft.hours === '' ? undefined : draft.hours,
    };

    const editing = placeDraft?.id;
    if (editing !== undefined) {
      placesCol.update(editing, patch);
      setPlaceDraft(null);
      toast.success(`${draft.name} saved`, { description: `${draft.level}, and back on the map.` });
      return;
    }

    const made = placesCol.create({ ...patch, addedBy: me });
    setPlaceDraft(null);
    setFloor(draft.level);
    setLens('floor');
    toast.success(`${draft.name} is on the map`, {
      description: 'Anyone can search it and Pathfinder will route them to it.',
      action: { label: 'Undo', onClick: () => placesCol.remove(made.id) },
    });
  };

  const dropPlace = (place: Place) => {
    const linked = closures.filter(
      (closure) => closure.scope === 'place' && closure.targetId === place.id,
    );

    placesCol.remove(place.id);
    linked.forEach((closure) => closuresCol.update(closure.id, { active: false }));
    if (target === place.id) setTarget(null);

    toast.success(`${place.name} removed`, {
      description:
        linked.length > 0
          ? `${linked.length} closure${linked.length === 1 ? '' : 's'} pointed at it, so ${
              linked.length === 1 ? 'it has' : 'they have'
            } been switched off.`
          : 'Nobody will be routed to it any more.',
      action: {
        label: 'Undo',
        onClick: () => {
          placesCol.create({ ...place });
          linked.forEach((closure) => closuresCol.update(closure.id, { active: closure.active }));
        },
      },
    });
  };

  const saveClosure = (draft: ClosureDraft) => {
    const editing = closureDraft?.id;
    if (editing !== undefined) {
      closuresCol.update(editing, { ...draft });
      setClosureDraft(null);
      toast.success(`${draft.title} saved`);
      return;
    }

    const made = closuresCol.create({ ...draft, raisedBy: me });
    setClosureDraft(null);
    setLens('closures');
    toast.success(`${draft.title} is logged`, {
      description: draft.active
        ? 'Routes are already going round it.'
        : 'Switch it on when you want routes to avoid it.',
      action: { label: 'Undo', onClick: () => closuresCol.remove(made.id) },
    });
  };

  const toggleClosure = (closure: Closure) => {
    closuresCol.update(closure.id, { active: !closure.active });
    toast.success(closure.active ? `${closure.title} is off` : `${closure.title} is on`, {
      description: closure.active
        ? 'Routes can go through it again.'
        : 'Every route will now go round it.',
      action: {
        label: 'Undo',
        onClick: () => closuresCol.update(closure.id, { active: closure.active }),
      },
    });
  };

  const dropClosure = (closure: Closure) => {
    closuresCol.remove(closure.id);
    toast.success(`${closure.title} deleted`, {
      action: { label: 'Undo', onClick: () => closuresCol.create({ ...closure }) },
    });
  };

  const tell = (hop: Hop) => {
    const { route: walk, place, nextMeeting: late, gap } = hop;
    if (walk === undefined || place === undefined || late === undefined) return;

    const kept = late.notes;
    const between =
      gap === 0
        ? `${hop.meeting.title} runs right up to this one`
        : `there ${gap === 1 ? 'is' : 'are'} only ${gap} minutes after ${hop.meeting.title}`;
    const line = `${me} is coming from ${place.name} and cannot make the start — the walk is ${walkMinutes(
      walk,
    )} minutes and ${between}.`;

    meetingsCol.update(late.id, { notes: kept === undefined ? line : `${kept}\n${line}` });

    const yours = late.organizer === me;
    toast.success(yours ? 'Noted on your own session' : `${late.organizer} will see it`, {
      description: yours
        ? `${late.title} is yours, so you are the one who can move it.`
        : `The note is on ${late.title} in their calendar, with the numbers.`,
      action: { label: 'Undo', onClick: () => meetingsCol.update(late.id, { notes: kept }) },
    });
  };

  const heading =
    lens === 'route'
      ? (to?.name ?? 'Where to?')
      : lens === 'floor'
        ? `${rows.length} on ${floor}`
        : lens === 'day'
          ? `${mine.length} in your day`
          : `${closures.length} closures`;

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">Pathfinder · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">Every walk, measured before you take it</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              Pathfinder knows the building, not just the map. It measures the route, adds the lift
              wait, routes round whatever is shut, and tells you when to leave.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setClosureDraft({ draft: blankClosure() })}
              className="dx-btn-secondary"
            >
              <Ban size={15} aria-hidden="true" />
              Close something off
            </button>
            <button
              type="button"
              onClick={() => setPlaceDraft({ draft: blankPlace(floor) })}
              className="dx-btn-primary"
            >
              <Plus size={15} aria-hidden="true" />
              Add a place
            </button>
          </div>
        </div>

        <section
          aria-label="The building at a glance"
          className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="dx-card px-5 py-4">
              <CountUp
                value={stat.value}
                className={cn(
                  'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                  stat.tone === 'brand' && 'text-brand-600',
                  stat.tone === 'warning' && stat.value > 0 && 'text-warning',
                  stat.tone === 'warning' && stat.value === 0 && 'text-ink',
                  stat.tone === 'neutral' && 'text-ink',
                )}
              />
              <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
          <div className="min-w-0 space-y-5">
            <section aria-labelledby="pathfinder-heading" className="dx-card overflow-hidden">
              <h3 id="pathfinder-heading" className="sr-only">
                Getting around the building
              </h3>

              <Toolbar
                lenses={LENSES}
                lens={lens}
                onLens={setLens}
                heading={heading}
                filters={filters}
                onFilters={setFilters}
                showFilters={lens === 'floor'}
              />

              {lens === 'route' && (
                <div className="px-4 py-5">
                  <RoutePanel
                    places={places}
                    spaces={spaces}
                    from={from}
                    to={to}
                    route={route}
                    stepFree={stepFree}
                    shut={shut}
                    clock={clock}
                    saved={to !== undefined && saved.includes(to.id)}
                    arrival={
                      next !== undefined && to?.id === next.place.id
                        ? {
                            label: next.meeting.title,
                            at: next.meeting.start,
                            leaveBy: next.leaveBy,
                            minutesLeft: next.minutesLeft,
                          }
                        : undefined
                    }
                    onFrom={start}
                    onTo={goTo}
                    onSwap={swap}
                    onSave={toggleSave}
                    onReport={() => setReporting(true)}
                    onStepFree={setStepFree}
                  />
                </div>
              )}

              {lens === 'floor' && (
                <>
                  <div className="border-b border-line px-4 py-3">
                    <div
                      role="tablist"
                      aria-label="Floors"
                      className="flex flex-wrap gap-1"
                    >
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          role="tab"
                          aria-selected={level === floor}
                          onClick={() => setFloor(level)}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[0.8125rem] transition-colors duration-[160ms]',
                            level === floor
                              ? 'bg-brand-600 font-medium text-nt-0'
                              : 'bg-nt-50 text-ink-muted hover:text-ink',
                          )}
                        >
                          {levelShort(level)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 pt-4">
                    <FloorPlan
                      level={floor}
                      places={places}
                      spaces={spaces}
                      route={route}
                      standingAt={from?.id}
                      selectedId={to?.id}
                      shut={shut}
                      onPick={goTo}
                    />
                  </div>

                  {rows.length === 0 ? (
                    <EmptyState
                      icon={SearchX}
                      title="Nothing on this floor matches that."
                      actionLabel="Clear the filters"
                      onAction={() => setFilters(NO_FILTERS)}
                    />
                  ) : (
                    <div className="mt-4">
                      <FloorList
                        rows={rows}
                        selectedId={to?.id}
                        onRoute={goTo}
                        onEdit={(place) =>
                          setPlaceDraft({ draft: draftFromPlace(place), id: place.id })
                        }
                        onDelete={dropPlace}
                      />
                    </div>
                  )}
                </>
              )}

              {lens === 'day' &&
                (mine.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="Nothing in your calendar today."
                    actionLabel="Find your way somewhere"
                    onAction={() => setLens('route')}
                  />
                ) : (
                  <DayList hops={hops} onRoute={goTo} onTell={tell} />
                ))}

              {lens === 'closures' &&
                (closures.length === 0 ? (
                  <EmptyState
                    icon={Ban}
                    title="Nothing is closed off."
                    actionLabel="Close something off"
                    onAction={() => setClosureDraft({ draft: blankClosure() })}
                  />
                ) : (
                  <ClosureList
                    closures={[...closures].sort(
                      (a, b) =>
                        Number(inForce(b, today)) - Number(inForce(a, today)) ||
                        a.from.localeCompare(b.from),
                    )}
                    places={places}
                    today={today}
                    onToggle={toggleClosure}
                    onEdit={(closure) =>
                      setClosureDraft({ draft: draftFromClosure(closure), id: closure.id })
                    }
                    onDelete={dropClosure}
                  />
                ))}
            </section>
          </div>

          <PathRail
            standing={from}
            next={next}
            clock={clock}
            saved={places.filter((place) => saved.includes(place.id))}
            live={live}
            places={places}
            stepFree={stepFree}
            onStepFree={setStepFree}
            onRoute={goTo}
            onClosures={() => setLens('closures')}
          />
        </div>
      </div>

      {reporting && to !== undefined && (
        <ReportDialog
          place={to}
          suggested={stepFree && !to.stepFree ? 'stepfree' : SYMPTOMS[0].id}
          onClose={() => setReporting(false)}
          onRaise={raise}
        />
      )}

      {placeDraft && (
        <PlaceDialog
          initial={placeDraft.draft}
          editingId={placeDraft.id}
          neighbours={places}
          onClose={() => setPlaceDraft(null)}
          onSave={savePlace}
        />
      )}

      {closureDraft && (
        <ClosureDialog
          initial={closureDraft.draft}
          editingId={closureDraft.id}
          places={places}
          onClose={() => setClosureDraft(null)}
          onSave={saveClosure}
        />
      )}
    </div>
  );
}
