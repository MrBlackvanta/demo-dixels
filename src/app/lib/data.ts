import { collection, scalar, seedOnce } from './store';
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

export interface Booking extends Entity {
  space: string;
  level: string;
  capacity: number;
  date: string;
  start: string;
  end: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
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

const dayOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const today = (): string => dayOffset(0);
const tomorrow = (): string => dayOffset(1);
const yesterday = (): string => dayOffset(-1);

const row = <T,>(data: T, i: number) => ({
  ...data,
  id: `seed_${i}`,
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
      col: bookings as never,
      rows: [
        { space: 'Studio 3', level: 'Level 2', capacity: 8, date: today(), start: '10:00', end: '11:00', purpose: 'Design sync', status: 'confirmed' },
        { space: 'Orchid', level: 'Level 5', capacity: 12, date: today(), start: '13:00', end: '14:00', purpose: 'Client visit', status: 'confirmed' },
        { space: 'Desk 4-118', level: 'Level 4', capacity: 1, date: today(), start: '09:00', end: '17:00', purpose: 'Focus day', status: 'pending' },
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
