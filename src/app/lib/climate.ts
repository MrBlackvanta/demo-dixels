import { toClock, toMinutes } from './format';
import { overlaps } from './agenda';
import type {
  Booking,
  ComfortVerdict,
  HvacMode,
  Meeting,
  Rule,
  RuleTrigger,
  Scene,
  SignState,
  Space,
  SpaceKind,
  Zone,
} from './data';

export const FLOOR_TARGET = 18;
export const CEILING_TARGET = 26;
export const COMFORT_LOW = 20.5;
export const COMFORT_HIGH = 23.5;
export const BASELINE = 22.5;
export const STEP = 0.5;

export const CO2_CLOSE = 800;
export const CO2_STUFFY = 1100;
export const HUMIDITY_LOW = 30;
export const HUMIDITY_HIGH = 60;

export const PER_DEGREE = 0.08;
export const SEAT_COST = 6;

const HOLDING = new Set(['confirmed', 'pending', 'checked-in']);

const RATE: Record<SpaceKind, number> = {
  'Focus pod': 0.16,
  Desk: 0.12,
  Huddle: 0.11,
  'Meeting room': 0.08,
  Training: 0.05,
};

export const MODE_LABEL: Record<HvacMode, string> = {
  auto: 'Auto',
  cool: 'Cooling',
  heat: 'Heating',
  fan: 'Fan only',
  off: 'Off',
};

export const MODE_SHORT: Record<HvacMode, string> = {
  auto: 'Auto',
  cool: 'Cool',
  heat: 'Heat',
  fan: 'Fan',
  off: 'Off',
};

export const SIGN_LABEL: Record<SignState, string> = {
  available: 'Open to interruption',
  busy: 'In a meeting',
  focus: 'Heads down',
  away: 'Not here',
};

export const VERDICT_LABEL: Record<ComfortVerdict, string> = {
  cold: 'Too cold',
  cool: 'A bit cool',
  right: 'Just right',
  warm: 'A bit warm',
  hot: 'Too warm',
};

export const TRIGGER_LABEL: Record<RuleTrigger, string> = {
  'meeting-starts': 'a meeting starts',
  'meeting-ends': 'a meeting ends',
  'day-starts': 'my day starts',
  'day-ends': 'my day ends',
  'room-empty': 'the room empties',
  'co2-high': 'the air goes stuffy',
};

export const FAN_LABEL = ['Off', 'Low', 'Medium', 'High'];

export const clampTarget = (value: number): number =>
  Math.min(CEILING_TARGET, Math.max(FLOOR_TARGET, Math.round(value * 2) / 2));

export const comfortOf = (temp: number): ComfortVerdict => {
  if (temp < COMFORT_LOW - 1.5) return 'cold';
  if (temp < COMFORT_LOW) return 'cool';
  if (temp > COMFORT_HIGH + 1.5) return 'hot';
  if (temp > COMFORT_HIGH) return 'warm';
  return 'right';
};

export const inComfortBand = (temp: number): boolean =>
  temp >= COMFORT_LOW && temp <= COMFORT_HIGH;

export const driftOf = (zone: Zone): number => Number((zone.temp - zone.target).toFixed(1));

const rateFor = (space: Space): number => RATE[space.kind];

export const minutesToTarget = (zone: Zone, space: Space): number =>
  Math.round(Math.abs(zone.temp - zone.target) / rateFor(space));

export const settled = (zone: Zone): boolean => Math.abs(zone.temp - zone.target) < 0.15;

export const readyAt = (zone: Zone, space: Space, clock: string): string =>
  toClock(toMinutes(clock) + minutesToTarget(zone, space));

export const airOf = (co2: number): 'fresh' | 'close' | 'stuffy' =>
  co2 >= CO2_STUFFY ? 'stuffy' : co2 >= CO2_CLOSE ? 'close' : 'fresh';

export const humidityOk = (humidity: number): boolean =>
  humidity >= HUMIDITY_LOW && humidity <= HUMIDITY_HIGH;

const energyIndex = (target: number): number => (BASELINE - target) * PER_DEGREE;

export const dailyCost = (target: number, space: Space): number =>
  Math.max(0, space.capacity * SEAT_COST * (1 + energyIndex(target)));

export const buildingCost = (zones: Zone[], spaces: Space[]): number => {
  const byId = new Map(spaces.map((space) => [space.id, space]));
  return zones.reduce((total, zone) => {
    const space = byId.get(zone.spaceId);
    if (!space || space.offline) return total;
    return total + dailyCost(zone.target, space);
  }, 0);
};

const holderOf = (
  bookings: Booking[],
  spaceId: string,
  date: string,
  clock: string,
): Booking | undefined =>
  bookings.find(
    (booking) =>
      booking.spaceId === spaceId &&
      booking.date === date &&
      HOLDING.has(booking.status) &&
      overlaps(clock, toClock(toMinutes(clock) + 1), booking.start, booking.end),
  );

export type Authority = 'yours' | 'shared' | 'held' | 'offline';

export interface Standing {
  authority: Authority;
  holder?: Booking;
  reason: string;
}

export const standingIn = (
  space: Space,
  bookings: Booking[],
  me: string,
  myDesk: string,
  date: string,
  clock: string,
): Standing => {
  if (space.offline)
    return {
      authority: 'offline',
      reason: space.note ?? 'This space is out of service, so its controls are locked.',
    };

  if (space.id === myDesk)
    return { authority: 'yours', reason: 'Your desk — nobody else sets this one.' };

  const holder = holderOf(bookings, space.id, date, clock);
  if (holder === undefined)
    return {
      authority: 'shared',
      reason: 'Nobody has booked this right now, so anyone in it can set it.',
    };

  if (holder.organizer === me)
    return { authority: 'yours', holder, reason: `You have this until ${holder.end}.` };

  return {
    authority: 'held',
    holder,
    reason: `${holder.organizer} has this until ${holder.end} for ${holder.purpose}.`,
  };
};

export const canControl = (standing: Standing): boolean =>
  standing.authority === 'yours' || standing.authority === 'shared';

export interface Tally {
  cold: string[];
  cool: string[];
  right: string[];
  warm: string[];
  hot: string[];
}

export const tallyOf = (
  votes: Array<{ spaceId: string; person: string; verdict: ComfortVerdict; at: string }>,
  spaceId: string,
  sinceHours = 8,
): Tally => {
  const cutoff = Date.now() - sinceHours * 3_600_000;
  const recent = votes.filter(
    (vote) => vote.spaceId === spaceId && new Date(vote.at).getTime() >= cutoff,
  );
  const latest = new Map<string, ComfortVerdict>();
  [...recent]
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach((vote) => latest.set(vote.person, vote.verdict));

  const tally: Tally = { cold: [], cool: [], right: [], warm: [], hot: [] };
  latest.forEach((verdict, person) => tally[verdict].push(person));
  return tally;
};

export const tallySize = (tally: Tally): number =>
  tally.cold.length + tally.cool.length + tally.right.length + tally.warm.length + tally.hot.length;

export interface Consensus {
  direction: -1 | 0 | 1;
  people: string[];
  nudge: number;
}

export const consensusOf = (tally: Tally): Consensus => {
  const chilly = [...tally.cold, ...tally.cool];
  const toasty = [...tally.hot, ...tally.warm];

  if (chilly.length >= 2 && chilly.length > toasty.length)
    return { direction: 1, people: chilly, nudge: tally.cold.length >= 2 ? 1.5 : 1 };

  if (toasty.length >= 2 && toasty.length > chilly.length)
    return { direction: -1, people: toasty, nudge: tally.hot.length >= 2 ? -1.5 : -1 };

  return { direction: 0, people: [], nudge: 0 };
};

export interface Change {
  label: string;
  from: string;
  to: string;
}

export const sceneChanges = (zone: Zone, scene: Scene): Change[] =>
  [
    { label: 'Temperature', from: `${zone.target.toFixed(1)}°`, to: `${scene.target.toFixed(1)}°` },
    { label: 'Air', from: MODE_LABEL[zone.mode], to: MODE_LABEL[scene.mode] },
    { label: 'Fan', from: FAN_LABEL[zone.fan], to: FAN_LABEL[scene.fan] },
    { label: 'Lights', from: `${zone.lights}%`, to: `${scene.lights}%` },
    { label: 'Warmth', from: `${zone.warmth}K`, to: `${scene.warmth}K` },
    { label: 'Blinds', from: `${zone.blinds}% open`, to: `${scene.blinds}% open` },
    { label: 'Sign', from: SIGN_LABEL[zone.sign], to: SIGN_LABEL[scene.sign] },
  ].filter((change) => change.from !== change.to);

export const nowInRoom = (
  meetings: Meeting[],
  spaceId: string,
  date: string,
  clock: string,
): Meeting | undefined =>
  meetings.find(
    (meeting) =>
      meeting.spaceId === spaceId &&
      meeting.date === date &&
      meeting.status !== 'cancelled' &&
      overlaps(clock, toClock(toMinutes(clock) + 1), meeting.start, meeting.end),
  );

export const leadFor = (zone: Zone, space: Space, target: number): number =>
  Math.max(5, Math.round(Math.abs(zone.temp - target) / rateFor(space)));

export const startBy = (meeting: Meeting, lead: number): string =>
  toClock(Math.max(0, toMinutes(meeting.start) - lead));

export const describeRule = (rule: Rule, spaces: Space[], scenes: Scene[]): string => {
  const where =
    rule.spaceId === undefined
      ? 'wherever I am'
      : (spaces.find((space) => space.id === rule.spaceId)?.name ?? 'a room');
  const scene = scenes.find((row) => row.id === rule.sceneId)?.name ?? 'a scene';
  const when = TRIGGER_LABEL[rule.trigger];
  const lead = rule.lead > 0 ? `${rule.lead} minutes before` : 'when';
  return `Set ${where} to ${scene} ${lead} ${when}.`;
};

export const tracking = (zone: Zone): boolean => zone.fault === undefined;

export const advanced = (zone: Zone, space: Space, minutes: number): number => {
  const gap = zone.target - zone.temp;
  if (!tracking(zone) || Math.abs(gap) < 0.15) return zone.temp;
  const move = Math.min(Math.abs(gap), rateFor(space) * minutes);
  return Number((zone.temp + Math.sign(gap) * move).toFixed(2));
};

export const warmthLabel = (kelvin: number): string =>
  kelvin <= 2900 ? 'Warm' : kelvin <= 4000 ? 'Neutral' : kelvin <= 5200 ? 'Daylight' : 'Crisp';
