import { cn } from '../../ui/utils';
import { PLAN_RATIO, SPINE, SPINE_EDGES } from '../../../lib/wayfinding';
import type { Node, Route } from '../../../lib/wayfinding';
import type { Place, Space } from '../../../lib/data';

const HEIGHT = 100 * PLAN_RATIO;

const sy = (y: number) => y * PLAN_RATIO;

const spineAt = (key: string) => SPINE.find((point) => point.key === key)!;

const FOOTPRINT: Partial<Record<Place['kind'], { w: number; h: number }>> = {
  room: { w: 15, h: 11 },
  desk: { w: 8, h: 5 },
  terrace: { w: 15, h: 11 },
  cafe: { w: 14, h: 10 },
  pantry: { w: 11, h: 8 },
  washroom: { w: 11, h: 8 },
  prayer: { w: 11, h: 9 },
  wellness: { w: 11, h: 9 },
  reception: { w: 16, h: 8 },
  itbar: { w: 12, h: 8 },
  locker: { w: 9, h: 7 },
};

const SEATED: Array<{ upTo: number; w: number; h: number }> = [
  { upTo: 1, w: 8, h: 6 },
  { upTo: 8, w: 14, h: 10 },
  { upTo: 24, w: 18, h: 13 },
  { upTo: Infinity, w: 22, h: 15 },
];

const footprintFor = (place: Place, seats?: number) => {
  if (place.kind !== 'room') return FOOTPRINT[place.kind];
  return SEATED.find((size) => (seats ?? 8) <= size.upTo)!;
};

interface FloorPlanProps {
  level: string;
  places: Place[];
  spaces: Space[];
  route?: Route;
  standingAt?: string;
  selectedId?: string;
  shut: Set<string>;
  onPick: (place: Place) => void;
}

export function FloorPlan({
  level,
  places,
  spaces,
  route,
  standingAt,
  selectedId,
  shut,
  onPick,
}: FloorPlanProps) {
  const here = places.filter((place) => place.level === level);
  const seatsIn = (place: Place) =>
    spaces.find((space) => space.id === place.spaceId)?.capacity;

  const legs: Node[][] = [];
  if (route?.found) {
    let leg: Node[] = [];
    route.nodes.forEach((node) => {
      if (node.level !== level) {
        if (leg.length > 1) legs.push(leg);
        leg = [];
        return;
      }
      leg.push(node);
    });
    if (leg.length > 1) legs.push(leg);
  }

  const onThisLevel = route?.nodes.some((node) => node.level === level) ?? false;

  return (
    <svg
      viewBox={`0 0 100 ${HEIGHT}`}
      className="w-full rounded-lg border border-line bg-nt-50"
      role="img"
      aria-label={`Floor plan of ${level}${onThisLevel ? ', with your route drawn on it' : ''}`}
    >
      <rect
        x={3}
        y={3}
        width={94}
        height={HEIGHT - 6}
        rx={2.5}
        className="fill-nt-0 stroke-line"
        strokeWidth={0.4}
      />

      {here.map((place) => {
        const box = footprintFor(place, seatsIn(place));
        if (box === undefined) return null;
        const closed = shut.has(place.id);
        const chosen = place.id === selectedId || place.id === standingAt;

        return (
          <rect
            key={`room-${place.id}`}
            x={place.x - box.w / 2}
            y={sy(place.y) - (box.h * PLAN_RATIO) / 2}
            width={box.w}
            height={box.h * PLAN_RATIO}
            rx={1.2}
            strokeWidth={0.4}
            className={cn(
              'transition-colors duration-[200ms]',
              closed
                ? 'fill-nt-100 stroke-line'
                : chosen
                  ? 'fill-brand-50 stroke-brand-300'
                  : 'fill-nt-50 stroke-line',
            )}
          />
        );
      })}

      {SPINE_EDGES.map(([from, to]) => {
        const a = spineAt(from);
        const b = spineAt(to);
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={sy(a.y)}
            x2={b.x}
            y2={sy(b.y)}
            strokeWidth={3.2}
            strokeLinecap="round"
            className="stroke-nt-100"
          />
        );
      })}

      {legs.map((leg, index) => (
        <polyline
          key={index}
          points={leg.map((node) => `${node.x},${sy(node.y)}`).join(' ')}
          fill="none"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-brand-500"
        />
      ))}

      {here.map((place) => {
        const isStart = place.id === standingAt;
        const isEnd = place.id === selectedId;
        const closed = shut.has(place.id);
        const onRoute = route?.nodes.some((node) => node.placeId === place.id) ?? false;

        return (
          <g key={place.id}>
            <circle
              cx={place.x}
              cy={sy(place.y)}
              r={isStart || isEnd ? 2.6 : 1.7}
              className={cn(
                'transition-all duration-[200ms]',
                closed
                  ? 'fill-nt-200'
                  : isEnd
                    ? 'fill-brand-600'
                    : isStart
                      ? 'fill-grn-600'
                      : onRoute
                        ? 'fill-brand-300'
                        : 'fill-nt-300',
              )}
            />
            {(isStart || isEnd) && (
              <circle
                cx={place.x}
                cy={sy(place.y)}
                r={1}
                className="fill-nt-0"
              />
            )}
            <title>{`${place.name}${closed ? ' — closed' : ''}`}</title>
            <circle
              cx={place.x}
              cy={sy(place.y)}
              r={3.4}
              className="cursor-pointer fill-transparent"
              onClick={() => onPick(place)}
            />
          </g>
        );
      })}

      {here
        .filter((place) => place.id === standingAt || place.id === selectedId)
        .map((place) => (
          <text
            key={`label-${place.id}`}
            x={place.x}
            y={sy(place.y) - 4}
            textAnchor="middle"
            className="fill-ink text-[3px] font-medium"
          >
            {place.name}
          </text>
        ))}
    </svg>
  );
}
