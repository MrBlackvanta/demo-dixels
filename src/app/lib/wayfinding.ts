import { toMinutes } from './format';
import type { Closure, Place, PlaceKind } from './data';

export const LEVELS = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
];

export const PLATE_W = 58;
export const PLATE_H = 42;

export const WALK_SPEED = 1.3;
export const LEAVE_ROOM = 30;
export const ENTER_ROOM = 20;
export const LIFT_BASE = 50;
export const LIFT_PER_LEVEL = 8;
export const LIFT_RUSH = 40;
export const STAIR_UP = 30;
export const STAIR_DOWN = 20;
export const BUFFER = 2;
export const TURN_DEGREES = 25;

const RUSH: Array<[string, string]> = [
  ['08:30', '09:30'],
  ['12:00', '13:30'],
  ['17:00', '18:00'],
];

export const KIND_LABEL: Record<PlaceKind, string> = {
  room: 'Meeting room',
  desk: 'Desk',
  lift: 'Lifts',
  stairs: 'Stairs',
  entrance: 'Entrance',
  reception: 'Reception',
  cafe: 'Café',
  pantry: 'Pantry',
  printer: 'Printer',
  prayer: 'Prayer room',
  wellness: 'Wellness room',
  washroom: 'Washroom',
  firstaid: 'First aid',
  exit: 'Fire exit',
  locker: 'Lockers',
  parking: 'Parking',
  post: 'Post and parcels',
  terrace: 'Terrace',
  itbar: 'IT bar',
};

export const FINDABLE: PlaceKind[] = [
  'room',
  'desk',
  'cafe',
  'pantry',
  'printer',
  'prayer',
  'wellness',
  'washroom',
  'firstaid',
  'locker',
  'post',
  'itbar',
  'terrace',
  'reception',
  'entrance',
  'parking',
  'exit',
];

export const levelIndex = (level: string): number => LEVELS.indexOf(level);

export const levelShort = (level: string): string => level.replace('Level ', 'L');

export const PLAN_RATIO = PLATE_H / PLATE_W;

export const SPINE: Array<{ key: string; x: number; y: number }> = [
  { key: 'west', x: 20, y: 50 },
  { key: 'core-a', x: 35, y: 50 },
  { key: 'middle', x: 50, y: 50 },
  { key: 'core-b', x: 65, y: 50 },
  { key: 'east', x: 80, y: 50 },
  { key: 'north', x: 50, y: 28 },
  { key: 'south', x: 50, y: 72 },
];

export const SPINE_EDGES: Array<[string, string]> = [
  ['west', 'core-a'],
  ['core-a', 'middle'],
  ['middle', 'core-b'],
  ['core-b', 'east'],
  ['middle', 'north'],
  ['middle', 'south'],
];

export const CORE_AT: Record<string, { x: number; y: number }> = {
  'core-a': { x: 35, y: 50 },
  'core-b': { x: 65, y: 50 },
  'stair-n': { x: 50, y: 28 },
  'stair-s': { x: 50, y: 72 },
};

export interface Node {
  id: string;
  level: string;
  x: number;
  y: number;
  placeId?: string;
  coreId?: string;
}

interface Edge {
  to: string;
  seconds: number;
  vertical?: 'lift' | 'stairs';
  coreId?: string;
}

export interface Graph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge[]>;
  byPlace: Map<string, string>;
  stepFree: boolean;
  shut: Set<string>;
  shutCores: Set<string>;
}

export const metresBetween = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  const dx = ((a.x - b.x) / 100) * PLATE_W;
  const dy = ((a.y - b.y) / 100) * PLATE_H;
  return Math.sqrt(dx * dx + dy * dy);
};

const secondsToWalk = (metres: number): number => metres / WALK_SPEED;

export const inRush = (clock: string): boolean => {
  const at = toMinutes(clock);
  return RUSH.some(([from, to]) => at >= toMinutes(from) && at < toMinutes(to));
};

export const liftWaitAt = (clock: string): number => LIFT_BASE + (inRush(clock) ? LIFT_RUSH : 0);

export const inForce = (closure: Closure, date: string): boolean =>
  closure.active && closure.from <= date && closure.until >= date;

const spineId = (level: string, key: string) => `sp:${level}:${key}`;

const placeNodeId = (placeId: string) => `pl:${placeId}`;

const link = (edges: Map<string, Edge[]>, from: string, to: string, edge: Omit<Edge, 'to'>) => {
  if (!edges.has(from)) edges.set(from, []);
  if (!edges.has(to)) edges.set(to, []);
  edges.get(from)!.push({ to, ...edge });
  edges.get(to)!.push({ to: from, ...edge });
};

const everyRideWithin = (stack: Place[]): Array<[Place, Place]> =>
  stack.flatMap((boarded, index) =>
    stack.slice(index + 1).map((left) => [boarded, left] as [Place, Place]),
  );

interface GraphOptions {
  stepFree: boolean;
  clock: string;
  date: string;
}

export function buildGraph(
  places: Place[],
  closures: Closure[],
  { stepFree, clock, date }: GraphOptions,
): Graph {
  const live = closures.filter((closure) => inForce(closure, date));
  const shut = new Set(
    live.filter((closure) => closure.scope === 'place').map((closure) => closure.targetId),
  );
  const shutCores = new Set(
    live.filter((closure) => closure.scope === 'core').map((closure) => closure.targetId),
  );

  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge[]>();
  const byPlace = new Map<string, string>();

  LEVELS.forEach((level) => {
    SPINE.forEach((point) => {
      const id = spineId(level, point.key);
      nodes.set(id, { id, level, x: point.x, y: point.y });
      edges.set(id, []);
    });
    SPINE_EDGES.forEach(([from, to]) => {
      const a = nodes.get(spineId(level, from))!;
      const b = nodes.get(spineId(level, to))!;
      link(edges, a.id, b.id, { seconds: secondsToWalk(metresBetween(a, b)) });
    });
  });

  const usable = places.filter(
    (place) => !shut.has(place.id) && levelIndex(place.level) >= 0 && (!stepFree || place.stepFree),
  );

  usable.forEach((place) => {
    const id = placeNodeId(place.id);
    nodes.set(id, {
      id,
      level: place.level,
      x: place.x,
      y: place.y,
      placeId: place.id,
      coreId: place.coreId,
    });
    edges.set(id, []);
    byPlace.set(place.id, id);

    const nearest = SPINE.map((point) => ({
      point,
      metres: metresBetween(place, point),
    })).sort((a, b) => a.metres - b.metres)[0];

    link(edges, id, spineId(place.level, nearest.point.key), {
      seconds: secondsToWalk(nearest.metres),
    });
  });

  const cores = new Map<string, Place[]>();
  usable.forEach((place) => {
    if (place.coreId === undefined) return;
    if (!cores.has(place.coreId)) cores.set(place.coreId, []);
    cores.get(place.coreId)!.push(place);
  });

  cores.forEach((stack, coreId) => {
    if (shutCores.has(coreId)) return;

    const kind = stack[0]?.kind === 'stairs' ? 'stairs' : 'lift';
    if (stepFree && kind === 'stairs') return;

    const ordered = [...stack].sort((a, b) => levelIndex(a.level) - levelIndex(b.level));

    everyRideWithin(ordered).forEach(([boarded, left]) => {
      const climbed = levelIndex(left.level) - levelIndex(boarded.level);
      const seconds =
        kind === 'lift'
          ? liftWaitAt(clock) + climbed * LIFT_PER_LEVEL
          : climbed * ((STAIR_UP + STAIR_DOWN) / 2);

      link(edges, placeNodeId(boarded.id), placeNodeId(left.id), {
        seconds,
        vertical: kind,
        coreId,
      });
    });
  });

  return { nodes, edges, byPlace, stepFree, shut, shutCores };
}

export type StepKind = 'start' | 'walk' | 'vertical' | 'arrive';

export interface Step {
  kind: StepKind;
  text: string;
  seconds: number;
  level: string;
  metres?: number;
}

export interface Route {
  found: boolean;
  from?: Place;
  to?: Place;
  nodes: Node[];
  seconds: number;
  metres: number;
  climbs: number;
  steps: Step[];
  stepFree: boolean;
  blocked?: string;
}

const NO_ROUTE: Route = {
  found: false,
  nodes: [],
  seconds: 0,
  metres: 0,
  climbs: 0,
  steps: [],
  stepFree: false,
};

const shortest = (graph: Graph, from: string, to: string): string[] | undefined => {
  const best = new Map<string, number>([[from, 0]]);
  const cameFrom = new Map<string, string>();
  const settled = new Set<string>();

  while (settled.size < graph.nodes.size) {
    let here: string | undefined;
    let lowest = Infinity;
    best.forEach((cost, id) => {
      if (!settled.has(id) && cost < lowest) {
        lowest = cost;
        here = id;
      }
    });

    if (here === undefined) break;
    if (here === to) break;
    settled.add(here);

    for (const edge of graph.edges.get(here) ?? []) {
      if (settled.has(edge.to)) continue;
      const cost = lowest + edge.seconds;
      if (cost < (best.get(edge.to) ?? Infinity)) {
        best.set(edge.to, cost);
        cameFrom.set(edge.to, here);
      }
    }
  }

  if (!best.has(to)) return undefined;

  const path = [to];
  let cursor = to;
  while (cursor !== from) {
    const previous = cameFrom.get(cursor);
    if (previous === undefined) return undefined;
    path.unshift(previous);
    cursor = previous;
  }
  return path;
};

const turnAt = (before: Node, here: Node, after: Node): { degrees: number; side: 'left' | 'right' } => {
  const ax = ((here.x - before.x) / 100) * PLATE_W;
  const ay = ((here.y - before.y) / 100) * PLATE_H;
  const bx = ((after.x - here.x) / 100) * PLATE_W;
  const by = ((after.y - here.y) / 100) * PLATE_H;

  const cross = ax * by - ay * bx;
  const dot = ax * bx + ay * by;
  const degrees = Math.abs((Math.atan2(cross, dot) * 180) / Math.PI);

  return { degrees, side: cross > 0 ? 'right' : 'left' };
};

const edgeBetween = (graph: Graph, from: string, to: string): Edge | undefined =>
  (graph.edges.get(from) ?? []).find((edge) => edge.to === to);

const round5 = (metres: number): number => Math.max(5, Math.round(metres / 5) * 5);

const coreName = (places: Place[], coreId?: string): string =>
  places.find((place) => place.coreId === coreId)?.name ?? 'the lifts';

export function routeBetween(graph: Graph, places: Place[], fromId: string, toId: string): Route {
  const from = places.find((place) => place.id === fromId);
  const to = places.find((place) => place.id === toId);
  if (from === undefined || to === undefined) return { ...NO_ROUTE, blocked: 'Unknown place.' };
  if (fromId === toId) {
    return { ...NO_ROUTE, from, to, found: true, blocked: 'You are already there.' };
  }

  const startNode = graph.byPlace.get(fromId);
  const endNode = graph.byPlace.get(toId);

  if (startNode === undefined || endNode === undefined) {
    const missing = startNode === undefined ? from : to;
    return {
      ...NO_ROUTE,
      from,
      to,
      stepFree: graph.stepFree,
      blocked:
        graph.stepFree && !missing.stepFree
          ? `${missing.name} cannot be reached without steps.`
          : `${missing.name} is closed right now.`,
    };
  }

  const path = shortest(graph, startNode, endNode);
  if (path === undefined) {
    return {
      ...NO_ROUTE,
      from,
      to,
      stepFree: graph.stepFree,
      blocked: graph.stepFree
        ? 'No step-free route is open between these two right now.'
        : 'No route is open between these two right now.',
    };
  }

  const nodes = path.map((id) => graph.nodes.get(id)!);
  const steps: Step[] = [
    { kind: 'start', text: `Leave ${from.name}.`, seconds: LEAVE_ROOM, level: from.level },
  ];

  let metres = 0;
  let seconds = LEAVE_ROOM + ENTER_ROOM;
  let climbs = 0;

  let legMetres = 0;
  let legSeconds = 0;
  let legTurn: { degrees: number; side: 'left' | 'right' } | undefined;
  let legLevel = from.level;

  const flushLeg = () => {
    if (legMetres < 1) return;
    const distance = round5(legMetres);
    steps.push({
      kind: 'walk',
      text:
        legTurn === undefined
          ? `Follow the corridor for about ${distance} m.`
          : `Turn ${legTurn.side} and follow the corridor for about ${distance} m.`,
      seconds: legSeconds,
      metres: distance,
      level: legLevel,
    });
    legMetres = 0;
    legSeconds = 0;
    legTurn = undefined;
  };

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const here = nodes[i];
    const next = nodes[i + 1];
    const edge = edgeBetween(graph, here.id, next.id);
    if (edge === undefined) continue;

    seconds += edge.seconds;

    if (edge.vertical !== undefined) {
      flushLeg();
      climbs += 1;
      const up = levelIndex(next.level) > levelIndex(here.level);
      steps.push({
        kind: 'vertical',
        text: `Take ${coreName(places, edge.coreId)} ${up ? 'up' : 'down'} to ${next.level}.`,
        seconds: edge.seconds,
        level: next.level,
      });
      legLevel = next.level;
      continue;
    }

    const span = metresBetween(here, next);
    metres += span;

    const before = nodes[i - 1];
    if (before !== undefined && before.level === here.level && legMetres > 0) {
      const turn = turnAt(before, here, next);
      if (turn.degrees >= TURN_DEGREES) {
        flushLeg();
        legTurn = turn;
      }
    }

    legMetres += span;
    legSeconds += edge.seconds;
    legLevel = here.level;
  }

  flushLeg();
  steps.push({
    kind: 'arrive',
    text: `${to.name} is right in front of you.`,
    seconds: ENTER_ROOM,
    level: to.level,
  });

  return {
    found: true,
    from,
    to,
    nodes,
    seconds,
    metres,
    climbs,
    steps,
    stepFree: graph.stepFree,
  };
}

export const walkMinutes = (route: Route): number =>
  route.seconds === 0 ? 0 : Math.max(1, Math.round(route.seconds / 60));

export const walkLabel = (route: Route): string => {
  const minutes = walkMinutes(route);
  return `${minutes} min${route.metres >= 1 ? ` · ${Math.round(route.metres)} m` : ''}`;
};

export const leaveBy = (arriveBy: string, route: Route): number =>
  toMinutes(arriveBy) - walkMinutes(route) - BUFFER;

export type Verdict = 'fine' | 'tight' | 'no';

export const verdictOf = (gapMinutes: number, route: Route): Verdict => {
  if (!route.found) return 'no';
  const slack = gapMinutes - walkMinutes(route);
  if (slack < 0) return 'no';
  if (slack < BUFFER + 1) return 'tight';
  return 'fine';
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  fine: 'Enough time',
  tight: 'Tight',
  no: 'You cannot make this',
};

export const placeForSpace = (places: Place[], spaceId?: string): Place | undefined =>
  spaceId === undefined ? undefined : places.find((place) => place.spaceId === spaceId);

export const closureBite = (closure: Closure, places: Place[]): string => {
  if (closure.scope === 'core') {
    const stack = places.filter((place) => place.coreId === closure.targetId);
    const name = stack[0]?.name ?? closure.targetId;
    return `${name} — every floor it serves`;
  }
  const place = places.find((row) => row.id === closure.targetId);
  return place ? `${place.name} · ${place.level}` : closure.targetId;
};
