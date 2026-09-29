import { useState } from 'react';
import {
  Accessibility,
  ArrowUpDown,
  Ban,
  Bookmark,
  BookmarkCheck,
  Flag,
  Footprints,
  Repeat,
  Ruler,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { toClock } from '../../../lib/format';
import { KIND_LABEL, inRush, levelShort, walkMinutes } from '../../../lib/wayfinding';
import type { Route } from '../../../lib/wayfinding';
import { FloorPlan } from './FloorPlan';
import { PlacePicker } from './PlacePicker';
import { RouteSteps } from './RouteSteps';
import type { Place, Space } from '../../../lib/data';

interface Arrival {
  label: string;
  at: string;
  leaveBy: number;
  minutesLeft: number;
}

interface RoutePanelProps {
  places: Place[];
  spaces: Space[];
  from?: Place;
  to?: Place;
  route: Route;
  stepFree: boolean;
  shut: Set<string>;
  saved: boolean;
  clock: string;
  arrival?: Arrival;
  onFrom: (place: Place) => void;
  onTo: (place: Place) => void;
  onSwap: () => void;
  onSave: () => void;
  onReport: () => void;
  onStepFree: (on: boolean) => void;
}

export function RoutePanel({
  places,
  spaces,
  from,
  to,
  route,
  stepFree,
  shut,
  saved,
  clock,
  arrival,
  onFrom,
  onTo,
  onSwap,
  onSave,
  onReport,
  onStepFree,
}: RoutePanelProps) {
  const crossed = [...new Set(route.nodes.map((node) => node.level))];
  const [shown, setShown] = useState<string | null>(null);
  const level =
    shown !== null && crossed.includes(shown)
      ? shown
      : (crossed[0] ?? from?.level ?? 'Level 1');

  const minutes = walkMinutes(route);
  const busy = inRush(clock);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <PlacePicker
          id="route-from"
          label="Where you are"
          places={places}
          value={from}
          placeholder="A room, a desk, a pantry…"
          onPick={onFrom}
        />

        <button
          type="button"
          onClick={onSwap}
          aria-label="Swap start and destination"
          className="dx-btn-secondary mb-0.5 hidden justify-self-center sm:inline-flex"
        >
          <Repeat size={14} aria-hidden="true" />
        </button>

        <PlacePicker
          id="route-to"
          label="Where you are going"
          places={places}
          value={to}
          placeholder="Search anything in the building"
          onPick={onTo}
        />
      </div>

      {!route.found ? (
        <div className="rounded-lg border border-warning/35 bg-warning/[0.07] px-4 py-3.5">
          <p className="flex items-center gap-2 text-[0.875rem] font-medium text-ink">
            <Ban size={15} aria-hidden="true" className="text-warning" />
            {to === undefined ? 'Pick somewhere to go' : 'No way through right now'}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {route.blocked ?? 'Search the building above and Pathfinder will measure the walk.'}
          </p>
          {to?.detail !== undefined && route.blocked !== undefined && (
            <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{to.detail}</p>
          )}
          {stepFree && route.blocked !== undefined && (
            <button
              type="button"
              onClick={() => onStepFree(false)}
              className="dx-btn-ghost mt-2.5"
            >
              Show me the route with steps
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-line bg-nt-50 px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <p className="text-[2rem] font-medium leading-none tracking-[-0.035em] text-ink">
                {minutes}
                <span className="ml-1 text-[1rem] text-ink-muted">min</span>
              </p>
              {arrival !== undefined && (
                <p
                  className={cn(
                    'text-[0.875rem] font-medium',
                    arrival.minutesLeft < 0
                      ? 'text-warning'
                      : arrival.minutesLeft <= 5
                        ? 'text-warning'
                        : 'text-brand-700',
                  )}
                >
                  {arrival.minutesLeft < 0
                    ? `You should have left ${Math.abs(arrival.minutesLeft)} min ago`
                    : `Leave by ${toClock(arrival.leaveBy)}`}
                </p>
              )}
            </div>

            <p className="mt-2 text-[0.8125rem] text-ink-muted">
              {arrival === undefined
                ? `${from?.name ?? 'Here'} to ${to?.name ?? 'there'}.`
                : `To be in ${to?.name ?? 'the room'} for ${arrival.label} at ${arrival.at}.`}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.75rem] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Ruler size={13} aria-hidden="true" />
                {Math.round(route.metres)} m of walking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ArrowUpDown size={13} aria-hidden="true" />
                {route.climbs === 0
                  ? 'Same floor'
                  : `${route.climbs} floor change${route.climbs === 1 ? '' : 's'}`}
              </span>
              <span className="inline-flex items-center gap-1.5">
                {stepFree ? (
                  <Accessibility size={13} aria-hidden="true" />
                ) : (
                  <Footprints size={13} aria-hidden="true" />
                )}
                {stepFree ? 'Step-free the whole way' : 'Stairs allowed'}
              </span>
              {busy && route.climbs > 0 && (
                <span className="inline-flex items-center gap-1.5 text-warning">
                  <TriangleAlert size={13} aria-hidden="true" />
                  Lifts are busy right now
                </span>
              )}
            </div>
          </div>

          {crossed.length > 1 && (
            <div
              role="tablist"
              aria-label="Floors this route crosses"
              className="flex flex-wrap gap-1"
            >
              {crossed.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  role="tab"
                  aria-selected={entry === level}
                  onClick={() => setShown(entry)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[0.75rem] transition-colors duration-[160ms]',
                    entry === level
                      ? 'bg-brand-600 font-medium text-nt-0'
                      : 'bg-nt-50 text-ink-muted hover:text-ink',
                  )}
                >
                  {levelShort(entry)}
                </button>
              ))}
            </div>
          )}

          <FloorPlan
            level={level}
            places={places}
            spaces={spaces}
            route={route}
            standingAt={from?.id}
            selectedId={to?.id}
            shut={shut}
            onPick={onTo}
          />

          <div className="grid gap-5 lg:grid-cols-[1fr_15rem]">
            <div>
              <h4 className="dx-eyebrow mb-3">Step by step</h4>
              <RouteSteps steps={route.steps} />
            </div>

            <div className="space-y-2">
              {to !== undefined && (
                <div className="rounded-lg border border-line px-3.5 py-3">
                  <p className="text-[0.8125rem] font-medium text-ink">{to.name}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-ink-subtle">
                    {KIND_LABEL[to.kind]} · {to.level}
                  </p>
                  {to.detail !== undefined && (
                    <p className="mt-2 text-[0.75rem] text-ink-muted">{to.detail}</p>
                  )}
                  {to.hours !== undefined && (
                    <p className="mt-2 text-[0.75rem] text-ink-muted">Open {to.hours}</p>
                  )}
                </div>
              )}

              <button type="button" onClick={onSave} className="dx-btn-secondary w-full">
                {saved ? (
                  <BookmarkCheck size={14} aria-hidden="true" />
                ) : (
                  <Bookmark size={14} aria-hidden="true" />
                )}
                {saved ? 'Saved' : 'Save this place'}
              </button>

              <button type="button" onClick={onReport} className="dx-btn-ghost w-full">
                <Flag size={14} aria-hidden="true" />
                Something is wrong here
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
