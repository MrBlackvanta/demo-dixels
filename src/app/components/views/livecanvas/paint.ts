import { toClock, toMinutes, todayKey } from '../../../lib/format';
import { nowMinutes } from '../../../lib/agenda';
import { MENU } from '../nourish/menu';
import type {
  Booking,
  Canvas,
  CanvasTone,
  Closure,
  GatherEvent,
  Screen,
  Space,
  Visit,
  Zone,
} from '../../../lib/data';

export interface Frame {
  eyebrow: string;
  headline: string;
  lines: string[];
  footnote?: string;
  tone: CanvasTone;
  source: string;
}

export interface Board {
  spaces: Space[];
  bookings: Booking[];
  visits: Visit[];
  events: GatherEvent[];
  zones: Zone[];
  closures: Closure[];
}

const SOURCE_NAME: Record<Canvas['source'], string> = {
  notice: 'Written here',
  arrivals: 'VisitFlow',
  events: 'Gather',
  menu: 'Nourish',
  rooms: 'SpaceOS',
  comfort: 'Atmosphere',
  wayfinding: 'Pathfinder',
};

export const sourceName = (source: Canvas['source']): string => SOURCE_NAME[source];

export const isLiveSource = (source: Canvas['source']): boolean => source !== 'notice';

const shortName = (full: string): string => full.split(' ')[0];

const ARRIVING: Visit['status'][] = ['invited', 'pre-registered'];

const arrivals = (canvas: Canvas, board: Board, screen?: Screen): Frame => {
  const today = todayKey();
  const here = board.visits.filter((visit) => visit.date === today);
  const checkedIn = here.filter((visit) => visit.status === 'checked-in');
  const vip = checkedIn.find((visit) => visit.kind === 'VIP');

  if (canvas.id === 'cv-vip' && vip) {
    return {
      eyebrow: 'Expected guest',
      headline: `Welcome, ${vip.guest}`,
      lines: [vip.company, `${shortName(vip.host)} has been told you are here.`],
      footnote: canvas.footnote,
      tone: canvas.tone,
      source: SOURCE_NAME.arrivals,
    };
  }

  const waiting = here
    .filter((visit) => ARRIVING.includes(visit.status))
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  return {
    eyebrow: screen?.level === 'Level 1' ? 'Arriving today' : 'Visitors in the building',
    headline: `${here.length} ${here.length === 1 ? 'guest' : 'guests'} today`,
    lines: waiting
      .slice(0, 4)
      .map((visit) => `${visit.time} · ${visit.guest} — ${visit.company}`),
    footnote:
      checkedIn.length > 0
        ? `${checkedIn.length} already badged in.`
        : 'Reception badges every guest on arrival.',
    tone: canvas.tone,
    source: SOURCE_NAME.arrivals,
  };
};

const events = (canvas: Canvas, board: Board): Frame => {
  const today = todayKey();
  const clock = nowMinutes();
  const live = board.events
    .filter((event) => event.date === today && event.status === 'published')
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const ahead = live.filter((event) => toMinutes(event.end) > clock);
  const next = ahead[0];

  return {
    eyebrow: next === undefined ? 'On today' : 'Next up',
    headline: next?.title ?? 'That is everything for today',
    lines:
      next === undefined
        ? live.slice(-3).map((event) => `${event.start} · ${event.title}`)
        : [
            `${next.start}–${next.end} · ${next.location}`,
            `${next.going.length} going, hosted by ${next.host}`,
            ...ahead.slice(1, 3).map((event) => `Then ${event.start} · ${event.title}`),
          ],
    footnote: next === undefined ? 'Tomorrow starts again at 08:00.' : 'Join it in Gather.',
    tone: canvas.tone,
    source: SOURCE_NAME.events,
  };
};

const menu = (canvas: Canvas): Frame => {
  const open = MENU.filter((item) => !item.soldOut);
  const food = open.filter((item) => item.category === 'food').slice(0, 3);
  const bakery = open.filter((item) => item.category === 'bakery').slice(0, 2);
  const gone = MENU.filter((item) => item.soldOut);

  return {
    eyebrow: 'The Ground Café',
    headline: 'Serving now',
    lines: [...food, ...bakery].map((item) => `${item.name} · ${item.price} SAR`),
    footnote:
      gone.length > 0
        ? `Sold out: ${gone.map((item) => item.name).join(', ')}.`
        : 'Order ahead in Nourish and skip the queue.',
    tone: canvas.tone,
    source: SOURCE_NAME.menu,
  };
};

const rooms = (canvas: Canvas, board: Board, screen?: Screen): Frame => {
  const today = todayKey();
  const clock = nowMinutes();
  const held = new Set(
    board.bookings
      .filter(
        (booking) =>
          booking.date === today &&
          booking.status !== 'cancelled' &&
          toMinutes(booking.start) <= clock &&
          toMinutes(booking.end) > clock,
      )
      .map((booking) => booking.spaceId),
  );

  const mine = screen?.spaceId === undefined ? undefined : board.spaces.find((space) => space.id === screen.spaceId);

  if (mine !== undefined) {
    const now = board.bookings.find(
      (booking) =>
        booking.spaceId === mine.id &&
        booking.date === today &&
        booking.status !== 'cancelled' &&
        toMinutes(booking.start) <= clock &&
        toMinutes(booking.end) > clock,
    );
    const next = board.bookings
      .filter(
        (booking) =>
          booking.spaceId === mine.id &&
          booking.date === today &&
          booking.status !== 'cancelled' &&
          toMinutes(booking.start) > clock,
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];

    return {
      eyebrow: `${mine.name} · ${mine.level}`,
      headline: now === undefined ? 'Free right now' : now.purpose,
      lines:
        now === undefined
          ? [
              next === undefined
                ? 'Nothing booked for the rest of the day.'
                : `Free until ${next.start}, then ${next.purpose}.`,
              `Seats ${mine.capacity} · ${mine.amenities.join(', ')}`,
            ]
          : [
              `${now.start}–${now.end} · ${now.organizer}`,
              `${now.attendees} of ${mine.capacity} seats`,
              next === undefined ? 'Free after this.' : `Then ${next.start} · ${next.purpose}`,
            ],
      footnote: now === undefined ? 'Tap your badge to take it for 30 minutes.' : undefined,
      tone: canvas.tone,
      source: SOURCE_NAME.rooms,
    };
  }

  const free = board.spaces
    .filter((space) => space.kind !== 'Desk' && !space.offline && !held.has(space.id))
    .sort((a, b) => (a.level === screen?.level ? -1 : 0) - (b.level === screen?.level ? -1 : 0));

  return {
    eyebrow: 'Free right now',
    headline: `${free.length} rooms open`,
    lines: free.slice(0, 4).map((space) => `${space.name} · ${space.level} · seats ${space.capacity}`),
    footnote: 'Book one in SpaceOS, or badge in at the door.',
    tone: canvas.tone,
    source: SOURCE_NAME.rooms,
  };
};

const VERDICT: Array<{ upTo: number; word: string }> = [
  { upTo: 800, word: 'fresh' },
  { upTo: 1100, word: 'fine' },
  { upTo: 1400, word: 'getting close' },
  { upTo: Infinity, word: 'stuffy' },
];

const comfort = (canvas: Canvas, board: Board, screen?: Screen): Frame => {
  const onFloor = board.zones.filter((zone) => {
    const space = board.spaces.find((row) => row.id === zone.spaceId);
    return screen === undefined || space?.level === screen.level;
  });
  const pool = onFloor.length > 0 ? onFloor : board.zones;
  const temp = pool.reduce((sum, zone) => sum + zone.temp, 0) / pool.length;
  const co2 = Math.round(pool.reduce((sum, zone) => sum + zone.co2, 0) / pool.length);
  const worst = [...pool].sort((a, b) => b.co2 - a.co2)[0];
  const spaceName = board.spaces.find((space) => space.id === worst?.spaceId)?.name;

  return {
    eyebrow: screen === undefined ? 'Across the building' : `${screen.level} right now`,
    headline: `${temp.toFixed(1)}°C and ${VERDICT.find((row) => co2 <= row.upTo)!.word}`,
    lines: [
      `CO₂ averaging ${co2} ppm across ${pool.length} zones.`,
      spaceName === undefined ? '' : `${spaceName} is the one to air out first.`,
    ].filter(Boolean),
    footnote: 'Too warm or too cold? Say so in Atmosphere — it takes one tap.',
    tone: canvas.tone,
    source: SOURCE_NAME.comfort,
  };
};

const wayfinding = (canvas: Canvas, board: Board): Frame => {
  const today = todayKey();
  const shut = board.closures.filter(
    (closure) => closure.active && closure.from <= today && closure.until >= today,
  );

  return {
    eyebrow: shut.length === 0 ? 'Getting around' : 'Shut right now',
    headline:
      shut.length === 0 ? 'Everything is open' : `${shut.length} ${shut.length === 1 ? 'route is' : 'routes are'} closed`,
    lines: shut.slice(0, 3).map((closure) => closure.title),
    footnote:
      shut.length === 0
        ? 'Pathfinder will route you anyway.'
        : 'Pathfinder is already routing around them.',
    tone: canvas.tone,
    source: SOURCE_NAME.wayfinding,
  };
};

const notice = (canvas: Canvas): Frame => ({
  eyebrow: 'Notice',
  headline: canvas.headline ?? canvas.title,
  lines: canvas.body === undefined ? [] : [canvas.body],
  footnote: canvas.footnote,
  tone: canvas.tone,
  source: SOURCE_NAME.notice,
});

export function paint(canvas: Canvas, board: Board, screen?: Screen): Frame {
  switch (canvas.source) {
    case 'arrivals':
      return arrivals(canvas, board, screen);
    case 'events':
      return events(canvas, board);
    case 'menu':
      return menu(canvas);
    case 'rooms':
      return rooms(canvas, board, screen);
    case 'comfort':
      return comfort(canvas, board, screen);
    case 'wayfinding':
      return wayfinding(canvas, board);
    default:
      return notice(canvas);
  }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const onAirNow = (channel: { days: string[]; from: string; until: string }): boolean => {
  const clock = nowMinutes();
  return (
    channel.days.includes(DAY_NAMES[new Date().getDay()]) &&
    clock >= toMinutes(channel.from) &&
    clock < toMinutes(channel.until)
  );
};

export const loopLength = (seconds: number[]): number => seconds.reduce((sum, row) => sum + row, 0);

export const playingAt = (durations: number[], elapsed: number): { index: number; into: number } => {
  const total = loopLength(durations);
  if (total === 0) return { index: 0, into: 0 };
  let cursor = elapsed % total;
  for (let index = 0; index < durations.length; index += 1) {
    if (cursor < durations[index]) return { index, into: cursor };
    cursor -= durations[index];
  }
  return { index: 0, into: 0 };
};

export const windowLabel = (channel: { from: string; until: string }): string =>
  `${toClock(toMinutes(channel.from))} – ${toClock(toMinutes(channel.until))}`;
