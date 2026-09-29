import { AlertTriangle, CalendarClock, Gauge, Snowflake, Wand2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { money } from '../../../lib/format';
import { VERDICT_LABEL, comfortOf } from '../../../lib/climate';
import type { Meeting, Space, Zone } from '../../../lib/data';
import { VERDICT_TONE, degrees } from './comfort';
import type { ZoneRow } from './comfort';

interface Upcoming {
  meeting: Meeting;
  space: Space;
  zone: Zone;
  minutesAway: number;
  arrivingAt: number;
  startBy: string;
  lead: number;
  wants: number;
  canSet: boolean;
}

interface ZoneRailProps {
  upcoming?: Upcoming;
  spend: number;
  comfortable: number;
  total: number;
  flagged: ZoneRow[];
  onPrepare: (upcoming: Upcoming) => void;
  onAutomate: (upcoming: Upcoming) => void;
  onOpen: (spaceId: string) => void;
}

export function ZoneRail({
  upcoming,
  spend,
  comfortable,
  total,
  flagged,
  onPrepare,
  onAutomate,
  onOpen,
}: ZoneRailProps) {
  return (
    <aside aria-label="What needs your attention" className="space-y-4">
      <section className="dx-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <CalendarClock size={14} aria-hidden="true" className="text-ink-subtle" />
          <h3 className="dx-eyebrow">Before your next meeting</h3>
        </div>

        {upcoming === undefined ? (
          <p className="px-5 py-6 text-[0.8125rem] text-ink-muted">
            Nothing left in a room today, so there is nothing to get ready.
          </p>
        ) : (
          <div className="px-5 py-5">
            <p className="text-[0.9375rem] font-medium text-ink">{upcoming.meeting.title}</p>
            <p className="mt-1 text-[0.75rem] text-ink-muted">
              {upcoming.meeting.start} · {upcoming.space.name} · {upcoming.space.level}
            </p>

            <div className="mt-4 rounded-lg bg-nt-50 px-4 py-3.5">
              <p className="text-[0.8125rem] text-ink">
                It is {degrees(upcoming.zone.temp)} in there now.
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                Left alone it will be {degrees(upcoming.arrivingAt)} when you walk in
                {upcoming.minutesAway > 0 && ` in ${upcoming.minutesAway} min`}.
              </p>
              <p className="mt-2 text-[0.75rem] text-brand-700">
                Getting it to {degrees(upcoming.wants)} takes about {upcoming.lead} min in a room
                this size, so it wants starting at {upcoming.startBy}.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!upcoming.canSet}
                onClick={() => onPrepare(upcoming)}
                className="dx-btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Snowflake size={14} aria-hidden="true" />
                Start it now
              </button>
              <button
                type="button"
                onClick={() => onAutomate(upcoming)}
                className="dx-btn-secondary"
              >
                <Wand2 size={14} aria-hidden="true" />
                Every time
              </button>
            </div>

            {!upcoming.canSet && (
              <p className="mt-2.5 text-[0.75rem] text-ink-muted">
                Somebody else has that room until your slot starts, so you cannot set it yet.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="dx-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Gauge size={14} aria-hidden="true" className="text-ink-subtle" />
          <h3 className="dx-eyebrow">The building right now</h3>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div>
            <p className="text-[1.75rem] font-medium leading-none tracking-[-0.035em] text-ink">
              {money(Math.round(spend))}
            </p>
            <p className="mt-1.5 text-[0.75rem] text-ink-muted">
              a day to hold every room where it is set
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-nt-100">
            <div
              className="h-full rounded-full bg-grn-500 transition-all duration-[240ms]"
              style={{ width: `${total === 0 ? 0 : (comfortable / total) * 100}%` }}
            />
          </div>
          <p className="text-[0.75rem] text-ink-muted">
            {comfortable} of {total} rooms sit inside the comfort band.
          </p>
        </div>
      </section>

      <section className="dx-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <AlertTriangle size={14} aria-hidden="true" className="text-ink-subtle" />
          <h3 className="dx-eyebrow">Worth a look</h3>
        </div>

        {flagged.length === 0 ? (
          <p className="px-5 py-6 text-[0.8125rem] text-ink-muted">
            Every room is where it should be.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {flagged.slice(0, 6).map((row) => {
              const verdict = comfortOf(row.zone.temp);
              return (
                <li key={row.zone.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(row.space.id)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-all duration-[140ms] hover:bg-nt-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] text-ink">
                        {row.space.name}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
                        {row.zone.fault !== undefined
                          ? row.zone.fault
                          : `${degrees(row.zone.temp)} against ${degrees(row.zone.target)}`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem]',
                        VERDICT_TONE[verdict],
                      )}
                    >
                      {VERDICT_LABEL[verdict]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}

export type { Upcoming };
