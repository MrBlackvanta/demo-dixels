import { collection, scalar, seedOnce } from './store';
import {
  BADGES,
  BOOKINGS,
  DELIVERIES,
  EVENTS,
  MEETINGS,
  NOTIFICATIONS,
  ORDERS,
  POSTS,
  PROJECTS,
  REQUESTS,
  SPACES,
  TASKS,
  TICKETS,
  TRIBES,
  VISITS,
} from './seed';
import type { Entity } from './store';
import type { Persona } from './products';

export interface Meeting extends Entity {
  title: string;
  space: string;
  level: string;
  start: string;
  end: string;
  attendees: string[];
  status: 'confirmed' | 'tentative' | 'proposed';
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

export interface TaskOrigin {
  module: string;
  ref: string;
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
  origin?: TaskOrigin;
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

export const persona = scalar<Persona>('persona', 'Employee');
export const authed = scalar<boolean>('authed', false);
export const sidebarOpen = scalar<boolean>('sidebarOpen', true);
export const orderDestination = scalar<string>('orderDestination', 'Desk 4-118');

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
      rows: MEETINGS.map(row),
    },
    {
      col: spaces as never,
      rows: SPACES.map(keyed),
    },
    {
      col: bookings as never,
      rows: BOOKINGS.map(row),
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
  ]);
}
