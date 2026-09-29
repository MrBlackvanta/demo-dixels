import { collection, scalar, seedOnce } from './store';
import {
  BADGES,
  BOOKINGS,
  CLOSURES,
  DELIVERIES,
  EVENTS,
  MEETINGS,
  NOTIFICATIONS,
  ORDERS,
  PLACES,
  POSTS,
  PROJECTS,
  REQUESTS,
  RULES,
  SCENES,
  SPACES,
  TASKS,
  TICKETS,
  TRIBES,
  VISITS,
  VOTES,
  ZONES,
} from './seed';
import type { Entity } from './store';
import type { Persona } from './products';

export interface Origin {
  module: string;
  ref: string;
}

export type MeetingKind =
  | 'meeting'
  | 'focus'
  | 'workshop'
  | 'one-to-one'
  | 'interview'
  | 'gathering';

export type MeetingStatus = 'confirmed' | 'tentative' | 'cancelled';

export type Rsvp = 'yes' | 'no' | 'maybe' | 'pending';

export interface Invitee {
  name: string;
  answer: Rsvp;
  optional: boolean;
}

export interface Meeting extends Entity {
  title: string;
  agenda: string;
  kind: MeetingKind;
  date: string;
  start: string;
  end: string;
  organizer: string;
  invitees: Invitee[];
  status: MeetingStatus;
  online: boolean;
  place?: string;
  spaceId?: string;
  bookingId?: string;
  taskId?: string;
  eventId?: string;
  origin?: Origin;
  repeats?: string;
  notes?: string;
}

export type SpaceKind = 'Meeting room' | 'Huddle' | 'Focus pod' | 'Desk' | 'Training';

export interface Space extends Entity {
  name: string;
  kind: SpaceKind;
  level: string;
  capacity: number;
  amenities: string[];
  utilisation: number;
  offline: boolean;
  approval: boolean;
  note?: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'checked-in' | 'cancelled' | 'declined';

export interface Booking extends Entity {
  space: string;
  level: string;
  capacity: number;
  date: string;
  start: string;
  end: string;
  purpose: string;
  status: BookingStatus;
  spaceId?: string;
  eventId?: string;
  organizer?: string;
  attendees?: number;
  checkedInAt?: string;
}

export type VisitStatus =
  | 'invited'
  | 'pre-registered'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled';

export type VisitKind = 'Guest' | 'VIP' | 'Interview' | 'Vendor' | 'Contractor';

export interface Visit extends Entity {
  guest: string;
  company: string;
  host: string;
  date: string;
  time: string;
  purpose: string;
  status: VisitStatus;
  email?: string;
  kind?: VisitKind;
  spaceId?: string;
  location?: string;
  parking?: boolean;
  notes?: string;
  code?: string;
  badge?: string;
  arrivedAt?: string;
  leftAt?: string;
}

export type EventCategory = 'Learning' | 'Social' | 'Wellness' | 'Town hall' | 'Culture';

export type EventMode = 'In person' | 'Hybrid' | 'Virtual';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface GatherEvent extends Entity {
  title: string;
  category: EventCategory;
  mode: EventMode;
  date: string;
  start: string;
  end: string;
  location: string;
  host: string;
  team: string;
  capacity: number;
  going: string[];
  waitlist: string[];
  summary: string;
  tags: string[];
  price: number;
  required: boolean;
  status: EventStatus;
  spaceId?: string;
  tribeId?: string;
}

export type TribeCategory = 'Professional' | 'Wellness' | 'Social' | 'Creative' | 'Giving';

export type TribeAccess = 'open' | 'request';

export interface Tribe extends Entity {
  name: string;
  category: TribeCategory;
  tagline: string;
  about: string;
  lead: string;
  members: string[];
  pending: string[];
  access: TribeAccess;
  archived: boolean;
  tags: string[];
  home: string;
}

export type PostKind = 'update' | 'question' | 'win';

export interface Reply {
  author: string;
  body: string;
  at: string;
}

export interface Post extends Entity {
  tribeId: string;
  author: string;
  body: string;
  at: string;
  kind: PostKind;
  likes: string[];
  replies: Reply[];
  pinned: boolean;
}

export interface Badge extends Entity {
  number: string;
  visitId?: string;
}

export interface Delivery extends Entity {
  recipient: string;
  carrier: string;
  tracking: string;
  collected: boolean;
}

export interface OrderLine {
  menuItemId: string;
  name: string;
  options: string;
  unitPrice: number;
  quantity: number;
}

export interface Order extends Entity {
  item: string;
  options: string;
  destination: string;
  price: number;
  status: 'placed' | 'preparing' | 'on-the-way' | 'delivered';
  lines?: OrderLine[];
  note?: string;
}

export interface CartLine extends Entity {
  menuItemId: string;
  name: string;
  options: string;
  unitPrice: number;
  quantity: number;
}

export type TicketTeam = 'IT' | 'Workplace' | 'AV' | 'Security' | 'Catering';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved';

export type ThreadEntryKind = 'note' | 'event';

export interface ThreadEntry {
  author: string;
  body: string;
  at: string;
  kind: ThreadEntryKind;
}

export interface Ticket extends Entity {
  ref: string;
  subject: string;
  detail: string;
  category: string;
  team: TicketTeam;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  requester: string;
  openedAt: string;
  dueAt: string;
  thread: ThreadEntry[];
  assignee?: string;
  spaceId?: string;
  resolvedAt?: string;
  rating?: number;
}

export type ServiceCategory = 'Technology' | 'Workplace' | 'People' | 'Travel' | 'Access';

export type RequestStage =
  | 'approval'
  | 'arranging'
  | 'ready'
  | 'delivered'
  | 'declined'
  | 'cancelled';

export type Verdict = 'pending' | 'approved' | 'declined';

export interface ApprovalStep {
  role: string;
  approver: string;
  verdict: Verdict;
  at?: string;
  note?: string;
}

export interface ServiceRequest extends Entity {
  ref: string;
  serviceId: string;
  service: string;
  category: ServiceCategory;
  choice: string;
  quantity: number;
  unitCost: number;
  requester: string;
  team: string;
  reason: string;
  costCentre: string;
  stage: RequestStage;
  raisedAt: string;
  neededBy: string;
  deliverTo: string;
  chain: ApprovalStep[];
  thread: ThreadEntry[];
  handler?: string;
  spaceId?: string;
  settledAt?: string;
  rating?: number;
}

export interface Project extends Entity {
  key: string;
  name: string;
  summary: string;
  lead: string;
  team: string;
  due: string;
  members: string[];
}

export type TaskState = 'backlog' | 'todo' | 'doing' | 'review' | 'done';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

export interface Checkpoint {
  label: string;
  done: boolean;
}

export interface Task extends Entity {
  ref: string;
  title: string;
  detail: string;
  projectId: string;
  state: TaskState;
  priority: TaskPriority;
  owner: string;
  team: string;
  estimate: number;
  logged: number;
  due: string;
  raisedAt: string;
  blockedBy: string[];
  checklist: Checkpoint[];
  tags: string[];
  thread: ThreadEntry[];
  origin?: Origin;
  spaceId?: string;
  startedAt?: string;
  doneAt?: string;
}

export interface Notification extends Entity {
  title: string;
  body: string;
  product: string;
  read: boolean;
}

export type HvacMode = 'auto' | 'cool' | 'heat' | 'fan' | 'off';

export type SignState = 'available' | 'busy' | 'focus' | 'away';

export type ComfortVerdict = 'cold' | 'cool' | 'right' | 'warm' | 'hot';

export interface Zone extends Entity {
  spaceId: string;
  temp: number;
  target: number;
  humidity: number;
  co2: number;
  noise: number;
  lux: number;
  mode: HvacMode;
  fan: number;
  lights: number;
  warmth: number;
  blinds: number;
  occupancy: number;
  sign: SignState;
  trend: number[];
  signNote?: string;
  setBy?: string;
  setAt?: string;
  fault?: string;
}

export interface ComfortVote extends Entity {
  spaceId: string;
  person: string;
  verdict: ComfortVerdict;
  at: string;
  note?: string;
  ticketId?: string;
}

export interface Scene extends Entity {
  name: string;
  summary: string;
  glyph: string;
  target: number;
  mode: HvacMode;
  fan: number;
  lights: number;
  warmth: number;
  blinds: number;
  sign: SignState;
  owner: string;
  shared: boolean;
  builtIn: boolean;
  uses: number;
  signNote?: string;
}

export type RuleTrigger =
  | 'meeting-starts'
  | 'meeting-ends'
  | 'day-starts'
  | 'day-ends'
  | 'room-empty'
  | 'co2-high';

export interface Rule extends Entity {
  name: string;
  trigger: RuleTrigger;
  sceneId: string;
  lead: number;
  owner: string;
  active: boolean;
  runs: number;
  spaceId?: string;
  kind?: MeetingKind;
  lastRun?: string;
}

export type PlaceKind =
  | 'room'
  | 'desk'
  | 'lift'
  | 'stairs'
  | 'entrance'
  | 'reception'
  | 'cafe'
  | 'pantry'
  | 'printer'
  | 'prayer'
  | 'wellness'
  | 'washroom'
  | 'firstaid'
  | 'exit'
  | 'locker'
  | 'parking'
  | 'post'
  | 'terrace'
  | 'itbar';

export interface Place extends Entity {
  name: string;
  kind: PlaceKind;
  level: string;
  x: number;
  y: number;
  stepFree: boolean;
  spaceId?: string;
  coreId?: string;
  detail?: string;
  hours?: string;
  addedBy?: string;
}

export type ClosureScope = 'place' | 'core';

export interface Closure extends Entity {
  title: string;
  scope: ClosureScope;
  targetId: string;
  reason: string;
  from: string;
  until: string;
  raisedBy: string;
  active: boolean;
  ticketId?: string;
}

export const meetings = collection<Meeting>('meetings');
export const spaces = collection<Space>('spaces');
export const bookings = collection<Booking>('bookings');
export const visits = collection<Visit>('visits');
export const events = collection<GatherEvent>('events');
export const tribes = collection<Tribe>('tribes');
export const posts = collection<Post>('posts');
export const badges = collection<Badge>('badges');
export const deliveries = collection<Delivery>('deliveries');
export const orders = collection<Order>('orders');
export const cart = collection<CartLine>('cart');
export const tickets = collection<Ticket>('tickets');
export const requests = collection<ServiceRequest>('requests');
export const projects = collection<Project>('projects');
export const tasks = collection<Task>('tasks');
export const notifications = collection<Notification>('notifications');
export const zones = collection<Zone>('zones');
export const comfortVotes = collection<ComfortVote>('comfortVotes');
export const scenes = collection<Scene>('scenes');
export const rules = collection<Rule>('rules');
export const places = collection<Place>('places');
export const closures = collection<Closure>('closures');

export const persona = scalar<Persona>('persona', 'Employee');
export const authed = scalar<boolean>('authed', false);
export const sidebarOpen = scalar<boolean>('sidebarOpen', true);
export const orderDestination = scalar<string>('orderDestination', 'Desk 4-118');
export const standingAt = scalar<string>('standingAt', 'pl-desk-4-118');
export const stepFreeOnly = scalar<boolean>('stepFreeOnly', false);
export const savedPlaces = scalar<string[]>('savedPlaces', []);

export const CURRENT_USER = {
  name: 'Sara Ahmed',
  initials: 'SA',
  role: 'Product Design Lead',
  team: 'Design',
  email: 'sara.ahmed@company.com',
  building: 'Riyadh HQ',
} as const;

const row = <T,>(data: T, i: number) => ({
  ...data,
  id: `seed_${i}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const keyed = <T extends { id: string }>(data: T) => ({
  ...data,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function seedDemoData(): void {
  seedOnce([
    {
      col: meetings as never,
      rows: MEETINGS.map(keyed),
    },
    {
      col: spaces as never,
      rows: SPACES.map(keyed),
    },
    {
      col: bookings as never,
      rows: BOOKINGS.map(keyed),
    },
    {
      col: visits as never,
      rows: VISITS.map(row),
    },
    {
      col: events as never,
      rows: EVENTS.map(keyed),
    },
    {
      col: tribes as never,
      rows: TRIBES.map(keyed),
    },
    {
      col: posts as never,
      rows: POSTS.map(keyed),
    },
    {
      col: badges as never,
      rows: BADGES.map(row),
    },
    {
      col: deliveries as never,
      rows: DELIVERIES.map(row),
    },
    {
      col: orders as never,
      rows: ORDERS.map(row),
    },
    {
      col: tickets as never,
      rows: TICKETS.map(keyed),
    },
    {
      col: requests as never,
      rows: REQUESTS.map(keyed),
    },
    {
      col: projects as never,
      rows: PROJECTS.map(keyed),
    },
    {
      col: tasks as never,
      rows: TASKS.map(keyed),
    },
    {
      col: notifications as never,
      rows: NOTIFICATIONS.map(row),
    },
    {
      col: zones as never,
      rows: ZONES.map(keyed),
    },
    {
      col: comfortVotes as never,
      rows: VOTES.map(row),
    },
    {
      col: scenes as never,
      rows: SCENES.map(keyed),
    },
    {
      col: rules as never,
      rows: RULES.map(keyed),
    },
    {
      col: places as never,
      rows: PLACES.map(keyed),
    },
    {
      col: closures as never,
      rows: CLOSURES.map(keyed),
    },
  ]);
}
