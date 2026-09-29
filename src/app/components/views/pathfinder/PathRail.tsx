import { Accessibility, Ban, Bookmark, Clock, Navigation, TriangleAlert } from 'lucide-react';
import { cn } from '../../ui/utils';
import { toClock } from '../../../lib/format';
import { closureBite, levelShort, walkMinutes } from '../../../lib/wayfinding';
import type { Route } from '../../../lib/wayfinding';
import { KIND_ICON } from './wayfind';
import type { Closure, Meeting, Place } from '../../../lib/data';

export interface NextStop {
  meeting: Meeting;
  place: Place;
  route: Route;
  leaveBy: number;
  minutesLeft: number;
}

interface PathRailProps {
  standing?: Place;
  next?: NextStop;
  clock: string;
  saved: Place[];
  live: Closure[];
  places: Place[];
  stepFree: boolean;
  onStepFree: (on: boolean) => void;
  onRoute: (place: Place) => void;
  onClosures: () => void;
}

export function PathRail({
  standing,
  next,
  clock,
  saved,
  live,
  places,
  stepFree,
  onStepFree,
  onRoute,
  onClosures,
}: PathRailProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <section className="dx-card px-5 py-4">
        <p className="dx-eyebrow mb-2">Where you are</p>
        {standing === undefined ? (
          <p className="text-[0.8125rem] text-ink-muted">Pick a starting point to begin.</p>
        ) : (
          <>
            <p className="text-[1.0625rem] font-medium text-ink">{standing.name}</p>
            <p className="mt-0.5 text-[0.75rem] text-ink-subtle">
              {standing.level} · it is {clock}
            </p>
          </>
        )}

        <label className="mt-3.5 flex items-start gap-2.5 border-t border-line pt-3.5">
          <input
            type="checkbox"
            checked={stepFree}
            onChange={(event) => onStepFree(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-600"
          />
          <span>
            <span className="flex items-center gap-1.5 text-[0.8125rem] text-ink">
              <Accessibility size={13} aria-hidden="true" />
              Step-free routes only
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-ink-muted">
              Lifts and level doors. Stairs come out of every route.
            </span>
          </span>
        </label>
      </section>

      {next !== undefined && (
        <section
          className={cn(
            'dx-card px-5 py-4',
            next.minutesLeft < 0 && 'border-warning/45',
          )}
        >
          <p className="dx-eyebrow mb-2">Next you are due somewhere</p>
          <p className="text-[0.9375rem] font-medium text-ink">{next.meeting.title}</p>
          <p className="mt-0.5 text-[0.75rem] text-ink-subtle">
            {next.meeting.start} · {next.place.name} · {levelShort(next.place.level)}
          </p>

          <p
            className={cn(
              'mt-3 flex items-center gap-1.5 text-[0.875rem] font-medium',
              next.minutesLeft < 0
                ? 'text-warning'
                : next.minutesLeft <= 5
                  ? 'text-warning'
                  : 'text-brand-700',
            )}
          >
            <Clock size={14} aria-hidden="true" />
            {next.minutesLeft < 0
              ? `You are ${Math.abs(next.minutesLeft)} min past leaving`
              : next.minutesLeft === 0
                ? 'Leave now'
                : `Leave in ${next.minutesLeft} min`}
          </p>

          <p className="mt-1.5 text-[0.75rem] text-ink-muted">
            {walkMinutes(next.route)} min walk from {standing?.name ?? 'here'}, so head off by{' '}
            {toClock(next.leaveBy)}.
          </p>

          <button
            type="button"
            onClick={() => onRoute(next.place)}
            className="dx-btn-secondary mt-3 w-full"
          >
            <Navigation size={14} aria-hidden="true" />
            Walk me there
          </button>
        </section>
      )}

      {live.length > 0 && (
        <section className="dx-card px-5 py-4">
          <p className="dx-eyebrow mb-2.5">Shut right now</p>
          <ul className="space-y-2.5">
            {live.map((closure) => (
              <li key={closure.id} className="flex gap-2.5">
                <TriangleAlert
                  size={13}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-warning"
                />
                <span className="min-w-0">
                  <span className="block text-[0.8125rem] text-ink">{closure.title}</span>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-subtle">
                    {closureBite(closure, places)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onClosures} className="dx-btn-ghost mt-3 w-full">
            <Ban size={13} aria-hidden="true" />
            All closures
          </button>
        </section>
      )}

      {saved.length > 0 && (
        <section className="dx-card px-5 py-4">
          <p className="dx-eyebrow mb-2.5">Saved</p>
          <ul className="space-y-1">
            {saved.map((place) => {
              const Icon = KIND_ICON[place.kind];
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => onRoute(place)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-[140ms] hover:bg-nt-50"
                  >
                    <Icon size={14} aria-hidden="true" className="shrink-0 text-ink-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] text-ink">{place.name}</span>
                      <span className="block text-[0.6875rem] text-ink-subtle">{place.level}</span>
                    </span>
                    <Bookmark size={12} aria-hidden="true" className="shrink-0 text-brand-500" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
