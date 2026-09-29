import { ArrowDown, Check, MapPin, Navigation, TriangleAlert, Video } from 'lucide-react';
import { cn } from '../../ui/utils';
import { KIND_NAME } from '../../../lib/agenda';
import { VERDICT_LABEL, levelShort, walkMinutes } from '../../../lib/wayfinding';
import type { Route, Verdict } from '../../../lib/wayfinding';
import type { Meeting, Place } from '../../../lib/data';

export interface Hop {
  meeting: Meeting;
  place?: Place;
  route?: Route;
  gap?: number;
  verdict?: Verdict;
  overlap?: boolean;
  sameRoom?: boolean;
  nextMeeting?: Meeting;
}

interface DayListProps {
  hops: Hop[];
  onRoute: (place: Place) => void;
  onTell: (hop: Hop) => void;
}

const TONE: Record<Verdict, string> = {
  fine: 'border-line bg-nt-50 text-ink-muted',
  tight: 'border-warning/35 bg-warning/[0.07] text-ink',
  no: 'border-warning/45 bg-warning/[0.12] text-ink',
};

export function DayList({ hops, onRoute, onTell }: DayListProps) {
  return (
    <ol className="divide-y divide-line">
      {hops.map((hop, index) => (
        <li key={hop.meeting.id} className="px-4 py-4">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            <p className="w-16 shrink-0 text-[0.8125rem] font-medium tabular-nums text-ink">
              {hop.meeting.start}
            </p>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.875rem] font-medium text-ink">{hop.meeting.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.75rem] text-ink-subtle">
                <span>{KIND_NAME[hop.meeting.kind]}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {hop.meeting.start}–{hop.meeting.end}
                </span>
                {hop.place !== undefined ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden="true" />
                      {hop.place.name} · {levelShort(hop.place.level)}
                    </span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Video size={11} aria-hidden="true" />
                      No room
                    </span>
                  </>
                )}
              </p>
            </div>

            {hop.place !== undefined && (
              <button
                type="button"
                onClick={() => onRoute(hop.place!)}
                className="dx-btn-ghost shrink-0"
              >
                <Navigation size={13} aria-hidden="true" />
                Take me there
              </button>
            )}
          </div>

          {index < hops.length - 1 && hop.verdict !== undefined && hop.route !== undefined && (
            <div
              className={cn(
                'mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3 py-2',
                TONE[hop.verdict],
              )}
            >
              {hop.verdict === 'fine' ? (
                <Check size={13} aria-hidden="true" className="shrink-0 text-grn-600" />
              ) : (
                <TriangleAlert size={13} aria-hidden="true" className="shrink-0 text-warning" />
              )}

              <p className="min-w-0 flex-1 text-[0.75rem]">
                <span className="font-medium">{VERDICT_LABEL[hop.verdict]}</span>
                {' — '}
                {hop.route.found
                  ? `${walkMinutes(hop.route)} min walk, ${hop.gap} min between them.`
                  : (hop.route.blocked ?? 'No route.')}
              </p>

              {hop.verdict === 'no' && (
                <button
                  type="button"
                  onClick={() => onTell(hop)}
                  className="dx-btn-ghost shrink-0"
                >
                  Tell the organiser
                </button>
              )}
            </div>
          )}

          {(hop.overlap === true || hop.sameRoom === true) && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-subtle">
              <ArrowDown size={11} aria-hidden="true" />
              {hop.overlap === true
                ? 'These two overlap, so no walk fixes it — that one is for your calendar.'
                : 'Same room, so there is nothing to walk.'}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
