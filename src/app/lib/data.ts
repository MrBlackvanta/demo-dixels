import { collection, scalar, seedOnce } from './store';
import { shiftDay, todayKey } from './format';
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
  location?: string;
  parking?: boolean;
  notes?: string;
  code?: string;
  badge?: string;
  arrivedAt?: string;
  leftAt?: string;
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

export interface Ticket extends Entity {
  subject: string;
  category: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
}

export interface Task extends Entity {
  title: string;
  due: string;
  effort: 'quick' | 'focused' | 'deep';
  done: boolean;
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
export const badges = collection<Badge>('badges');
export const deliveries = collection<Delivery>('deliveries');
export const orders = collection<Order>('orders');
export const cart = collection<CartLine>('cart');
export const tickets = collection<Ticket>('tickets');
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
  email: 'sara.ahmed@company.com',
  building: 'Riyadh HQ',
} as const;

const stamp = (offsetMinutes: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMinutes, 0, 0);
  return d.toISOString();
};

const todayAt = (clock: string): string => {
  const [hours, minutes] = clock.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const today = (): string => todayKey();
const tomorrow = (): string => shiftDay(todayKey(), 1);
const yesterday = (): string => shiftDay(todayKey(), -1);

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
      rows: [
        { title: 'Design sync', space: 'Studio 3', level: 'Level 2', start: stamp(35), end: stamp(95), attendees: ['SA', 'AK', 'LN'], status: 'confirmed' },
        { title: 'Client visit — Northwind', space: 'Orchid', level: 'Level 5', start: stamp(180), end: stamp(240), attendees: ['SA', 'MH'], status: 'confirmed' },
        { title: 'A little focus time', space: 'Quiet zone', level: 'Level 2', start: stamp(300), end: stamp(420), attendees: ['SA'], status: 'tentative' },
      ].map(row),
    },
    {
      col: spaces as never,
      rows: [
        { id: 'atrium', name: 'The Atrium', kind: 'Training', level: 'Level 1', capacity: 30, amenities: ['Display', 'Catering', 'Daylight'], utilisation: 88, offline: false, approval: true },
        { id: 'studio-3', name: 'Studio 3', kind: 'Meeting room', level: 'Level 2', capacity: 8, amenities: ['Video', 'Whiteboard', 'Display'], utilisation: 64, offline: false, approval: false },
        { id: 'pod-2a', name: 'Pod 2-A', kind: 'Focus pod', level: 'Level 2', capacity: 1, amenities: ['Soundproof'], utilisation: 71, offline: false, approval: false },
        { id: 'pod-2b', name: 'Pod 2-B', kind: 'Focus pod', level: 'Level 2', capacity: 1, amenities: ['Soundproof'], utilisation: 34, offline: false, approval: false },
        { id: 'cedar', name: 'Cedar', kind: 'Meeting room', level: 'Level 3', capacity: 6, amenities: ['Display', 'Whiteboard'], utilisation: 52, offline: false, approval: false },
        { id: 'jasmine', name: 'Jasmine', kind: 'Huddle', level: 'Level 3', capacity: 4, amenities: ['Display'], utilisation: 41, offline: false, approval: false },
        { id: 'desk-4-118', name: 'Desk 4-118', kind: 'Desk', level: 'Level 4', capacity: 1, amenities: ['Dual monitors', 'Daylight'], utilisation: 30, offline: false, approval: false },
        { id: 'desk-4-120', name: 'Desk 4-120', kind: 'Desk', level: 'Level 4', capacity: 1, amenities: ['Standing desk'], utilisation: 12, offline: true, approval: false, note: 'Monitor arm replacement — back Thursday.' },
        { id: 'orchid', name: 'Orchid', kind: 'Meeting room', level: 'Level 5', capacity: 12, amenities: ['Video', 'Display', 'Catering'], utilisation: 78, offline: false, approval: true },
        { id: 'boardroom', name: 'The Boardroom', kind: 'Meeting room', level: 'Level 6', capacity: 14, amenities: ['Video', 'Catering', 'Daylight'], utilisation: 23, offline: false, approval: true },
      ].map(keyed),
    },
    {
      col: bookings as never,
      rows: [
        { spaceId: 'studio-3', space: 'Studio 3', level: 'Level 2', capacity: 8, date: today(), start: '10:00', end: '11:00', purpose: 'Design sync', status: 'checked-in', organizer: 'Sara Ahmed', attendees: 3, checkedInAt: todayAt('09:58') },
        { spaceId: 'studio-3', space: 'Studio 3', level: 'Level 2', capacity: 8, date: today(), start: '15:30', end: '16:30', purpose: 'Partnership intro', status: 'confirmed', organizer: 'Sara Ahmed', attendees: 4 },
        { spaceId: 'orchid', space: 'Orchid', level: 'Level 5', capacity: 12, date: today(), start: '13:00', end: '14:00', purpose: 'Client visit — Northwind', status: 'confirmed', organizer: 'Sara Ahmed', attendees: 6 },
        { spaceId: 'orchid', space: 'Orchid', level: 'Level 5', capacity: 12, date: today(), start: '16:00', end: '17:00', purpose: 'Vendor demo', status: 'confirmed', organizer: 'Hana Youssef', attendees: 5 },
        { spaceId: 'cedar', space: 'Cedar', level: 'Level 3', capacity: 6, date: today(), start: '09:00', end: '10:30', purpose: 'Sprint planning', status: 'confirmed', organizer: 'Karim Fouad', attendees: 5 },
        { spaceId: 'jasmine', space: 'Jasmine', level: 'Level 3', capacity: 4, date: today(), start: '11:00', end: '12:00', purpose: 'Pair review', status: 'confirmed', organizer: 'Nadia Salem', attendees: 2 },
        { spaceId: 'pod-2a', space: 'Pod 2-A', level: 'Level 2', capacity: 1, date: today(), start: '14:00', end: '15:00', purpose: 'Focus block', status: 'confirmed', organizer: 'Sara Ahmed', attendees: 1 },
        { spaceId: 'desk-4-118', space: 'Desk 4-118', level: 'Level 4', capacity: 1, date: today(), start: '09:00', end: '17:00', purpose: 'Focus day', status: 'confirmed', organizer: 'Sara Ahmed', attendees: 1 },
        { spaceId: 'boardroom', space: 'The Boardroom', level: 'Level 6', capacity: 14, date: today(), start: '11:00', end: '13:00', purpose: 'Board lunch', status: 'pending', organizer: 'Exec office', attendees: 10 },
        { spaceId: 'atrium', space: 'The Atrium', level: 'Level 1', capacity: 30, date: today(), start: '09:00', end: '17:00', purpose: 'Onboarding week', status: 'pending', organizer: 'People team', attendees: 25 },
        { spaceId: 'studio-3', space: 'Studio 3', level: 'Level 2', capacity: 8, date: tomorrow(), start: '11:00', end: '12:00', purpose: 'Portfolio review', status: 'confirmed', organizer: 'Sara Ahmed', attendees: 3 },
      ].map(row),
    },
    {
      col: visits as never,
      rows: [
        { guest: 'Layla Nasser', company: 'Northwind', host: 'Sara Ahmed', date: today(), time: '13:00', purpose: 'Quarterly review', status: 'pre-registered', email: 'layla.nasser@northwind.com', kind: 'VIP', location: 'Orchid · Level 5', parking: true, code: 'VF-4180' },
        { guest: 'Omar Haddad', company: 'Vertex Labs', host: 'Sara Ahmed', date: today(), time: '15:30', purpose: 'Partnership intro', status: 'invited', email: 'o.haddad@vertexlabs.io', kind: 'Guest', location: 'Studio 3 · Level 2', parking: false, code: 'VF-7723' },
        { guest: 'Mei Chen', company: 'Aurora', host: 'Karim Fouad', date: today(), time: '09:15', purpose: 'Onsite audit', status: 'checked-in', email: 'mei.chen@aurora.co', kind: 'Vendor', location: 'Level 4 lounge', parking: false, code: 'VF-2094', badge: '104', arrivedAt: stamp(-95) },
        { guest: 'Daniel Okafor', company: 'Helios Group', host: 'Sara Ahmed', date: tomorrow(), time: '11:00', purpose: 'Design portfolio review', status: 'invited', email: 'd.okafor@helios.group', kind: 'Interview', location: 'Studio 3 · Level 2', parking: false, code: 'VF-5516' },
        { guest: 'Priya Raman', company: 'Meridian', host: 'Sara Ahmed', date: yesterday(), time: '14:00', purpose: 'Contract signing', status: 'checked-out', email: 'praman@meridian.com', kind: 'Guest', location: 'Orchid · Level 5', parking: true, code: 'VF-3341', arrivedAt: stamp(-1_500), leftAt: stamp(-1_380) },
      ].map(row),
    },
    {
      col: badges as never,
      rows: [
        { number: '101' },
        { number: '102' },
        { number: '103' },
        { number: '104', visitId: 'seed_2' },
        { number: '105' },
        { number: 'VIP-01' },
      ].map(row),
    },
    {
      col: deliveries as never,
      rows: [
        { recipient: 'Sara Ahmed', carrier: 'DHL', tracking: '7850 0212 3456', collected: false },
        { recipient: 'Karim Fouad', carrier: 'Aramex', tracking: '4471 9930 1122', collected: false },
        { recipient: 'Nadia Salem', carrier: 'FedEx', tracking: '9920 4417 8830', collected: true },
      ].map(row),
    },
    {
      col: orders as never,
      rows: [
        {
          item: 'Flat White',
          options: 'Large · Oat · Extra shot',
          destination: 'Studio 3 · Level 2',
          price: 23,
          status: 'on-the-way',
          lines: [{ menuItemId: 'flat-white', name: 'Flat White', options: 'Large · Oat · Extra shot', unitPrice: 23, quantity: 1 }],
        },
        {
          item: 'Jasmine Green Tea',
          options: 'Regular',
          destination: 'Desk 4-118',
          price: 21,
          status: 'delivered',
          lines: [
            { menuItemId: 'green-tea', name: 'Jasmine Green Tea', options: 'Regular', unitPrice: 9, quantity: 1 },
            { menuItemId: 'blueberry-muffin', name: 'Blueberry Muffin', options: 'Warmed', unitPrice: 12, quantity: 1 },
          ],
        },
      ].map(row),
    },
    {
      col: tickets as never,
      rows: [
        { subject: 'Projector not connecting in Orchid', category: 'AV', location: 'Level 5 · Orchid', priority: 'high', status: 'in-progress' },
        { subject: 'Level 4 north wing feels warm', category: 'Comfort', location: 'Level 4', priority: 'medium', status: 'open' },
      ].map(row),
    },
    {
      col: tasks as never,
      rows: [
        { title: 'Approve Northwind visit agenda', due: 'Today · 12:00', effort: 'quick', done: false },
        { title: 'Review Q3 space utilisation', due: 'Today · 16:00', effort: 'focused', done: false },
        { title: 'Sign off signage refresh', due: 'Tomorrow', effort: 'quick', done: true },
      ].map(row),
    },
    {
      col: notifications as never,
      rows: [
        { title: 'Layla Nasser pre-registered', body: 'Arriving 13:00 · Orchid, Level 5', product: 'VisitFlow', read: false },
        { title: 'Studio 3 is ready', body: 'Comfort set for your 10:00 sync', product: 'Atmosphere', read: false },
        { title: 'Your flat white is on the way', body: 'Delivering to Studio 3', product: 'Nourish', read: true },
      ].map(row),
    },
  ]);
}
