import {
  Armchair,
  BadgeCheck,
  Building2,
  CarFront,
  CreditCard,
  Figma,
  GraduationCap,
  Headphones,
  IdCard,
  Laptop,
  Leaf,
  Lock,
  Luggage,
  MonitorUp,
  Moon,
  Move,
  Plane,
  PanelTop,
  ScrollText,
  Terminal,
  Ticket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ApprovalStep, ServiceCategory, ServiceRequest } from './data';

export const SIGNOFF_FLOOR = 500;
export const FINANCE_FLOOR = 10_000;
export const FINANCE_APPROVER = 'Tarek Aziz';
export const SKIP_LEVEL = 'Noura Sami';

export const MANAGER_BY_TEAM: Record<string, string> = {
  Design: 'Sara Ahmed',
  Engineering: 'Karim Fouad',
  Product: 'Maya Fahmy',
  Data: 'Karim Fouad',
  IT: 'Karim Fouad',
  People: 'Lina Haddad',
  Workplace: 'Yousef Mansour',
  Finance: 'Waleed Tantawy',
  Commercial: 'Khaled Nour',
  Marketing: 'Amira Shafik',
  Legal: 'Noura Sami',
  Executive: 'Noura Sami',
};

export const COST_CENTRE: Record<string, string> = {
  Design: 'CC-4102',
  Engineering: 'CC-2201',
  Product: 'CC-2350',
  Data: 'CC-2410',
  IT: 'CC-2105',
  People: 'CC-6001',
  Workplace: 'CC-7010',
  Finance: 'CC-8000',
  Commercial: 'CC-3300',
  Marketing: 'CC-3120',
  Legal: 'CC-9004',
  Executive: 'CC-1000',
};

export const costCentreOf = (team: string): string => `${COST_CENTRE[team] ?? 'CC-0000'} · ${team}`;

export const managerOf = (team: string, requester: string): string => {
  const manager = MANAGER_BY_TEAM[team] ?? SKIP_LEVEL;
  if (manager !== requester) return manager;
  return SKIP_LEVEL === requester ? FINANCE_APPROVER : SKIP_LEVEL;
};

export interface ServiceChoice {
  label: string;
  cost: number;
}

export interface ServiceGate {
  role: string;
  approver: string;
}

export interface Service {
  id: string;
  name: string;
  blurb: string;
  category: ServiceCategory;
  icon: LucideIcon;
  choices: ServiceChoice[];
  leadDays: number;
  needs: string;
  gate?: ServiceGate;
  popular?: boolean;
  maxQuantity: number;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Technology',
  'Workplace',
  'People',
  'Travel',
  'Access',
];

export const CATEGORY_ICON: Record<ServiceCategory, LucideIcon> = {
  Technology: Laptop,
  Workplace: Building2,
  People: GraduationCap,
  Travel: Luggage,
  Access: IdCard,
};

export const CATEGORY_BLURB: Record<ServiceCategory, string> = {
  Technology: 'Machines, screens and the software seats that come with them.',
  Workplace: 'Your desk, your chair and the floor you sit on.',
  People: 'Letters, learning and the paperwork that proves you work here.',
  Travel: 'Trips, transfers and everything booked around them.',
  Access: 'Badges, bays and the doors that open after hours.',
};

export const SERVICES: Service[] = [
  {
    id: 'laptop-refresh',
    name: 'Laptop refresh',
    blurb: 'A replacement machine when yours is out of warranty or out of patience.',
    category: 'Technology',
    icon: Laptop,
    choices: [
      { label: 'MacBook Pro 14"', cost: 8400 },
      { label: 'MacBook Air 13"', cost: 6200 },
      { label: 'Dell XPS 15', cost: 7300 },
    ],
    leadDays: 3,
    needs: 'The asset tag on the machine you are replacing.',
    popular: true,
    maxQuantity: 1,
  },
  {
    id: 'second-screen',
    name: 'Second screen',
    blurb: 'An external display for your desk or a permanent home setup.',
    category: 'Technology',
    icon: MonitorUp,
    choices: [
      { label: '27-inch 4K', cost: 1450 },
      { label: '34-inch ultrawide', cost: 2650 },
    ],
    leadDays: 2,
    needs: 'Which desk it lands on, and whether you already have one.',
    maxQuantity: 2,
  },
  {
    id: 'design-seat',
    name: 'Design tool seat',
    blurb: 'A named licence on the design stack, billed to your team yearly.',
    category: 'Technology',
    icon: Figma,
    choices: [
      { label: 'Figma — editor', cost: 720 },
      { label: 'Adobe Creative Cloud', cost: 2400 },
    ],
    leadDays: 1,
    needs: 'The work you need it for — seats are reviewed every renewal.',
    gate: { role: 'Design tools owner', approver: 'Sara Ahmed' },
    popular: true,
    maxQuantity: 5,
  },
  {
    id: 'dev-seat',
    name: 'Engineering tool seat',
    blurb: 'Licences on the build, review and observability tooling.',
    category: 'Technology',
    icon: Terminal,
    choices: [
      { label: 'GitHub Copilot', cost: 480 },
      { label: 'JetBrains All Products', cost: 960 },
      { label: 'Datadog — full stack', cost: 1800 },
    ],
    leadDays: 1,
    needs: 'The repo or service you will be working in.',
    maxQuantity: 5,
  },
  {
    id: 'call-headset',
    name: 'Headset for calls',
    blurb: 'Something better than the laptop microphone for a room full of people.',
    category: 'Technology',
    icon: Headphones,
    choices: [
      { label: 'Over-ear, noise cancelling', cost: 640 },
      { label: 'Wireless earbuds', cost: 420 },
    ],
    leadDays: 1,
    needs: 'Nothing — pick one and it is on its way.',
    maxQuantity: 2,
  },
  {
    id: 'loan-kit',
    name: 'Loan kit for an event',
    blurb: 'Borrowed AV for a session, back on the shelf the next morning.',
    category: 'Technology',
    icon: PanelTop,
    choices: [
      { label: 'Roaming microphone', cost: 0 },
      { label: 'Clicker and spare cables', cost: 0 },
      { label: 'Camera on a tripod', cost: 0 },
    ],
    leadDays: 1,
    needs: 'The room and the day you need it.',
    maxQuantity: 3,
  },
  {
    id: 'ergo-chair',
    name: 'Ergonomic chair',
    blurb: 'A properly adjustable chair, fitted to you rather than to the floor plan.',
    category: 'Workplace',
    icon: Armchair,
    choices: [
      { label: 'Standard', cost: 2900 },
      { label: 'With headrest', cost: 3400 },
    ],
    leadDays: 5,
    needs: 'An assessment note if one has been done for you.',
    gate: { role: 'Workplace', approver: 'Yousef Mansour' },
    maxQuantity: 1,
  },
  {
    id: 'sit-stand',
    name: 'Sit-stand conversion',
    blurb: 'Your existing desk, motorised, so you can work standing up.',
    category: 'Workplace',
    icon: PanelTop,
    choices: [{ label: 'Full desk conversion', cost: 3600 }],
    leadDays: 5,
    needs: 'Your desk number — some frames cannot take the motor.',
    gate: { role: 'Workplace', approver: 'Yousef Mansour' },
    maxQuantity: 1,
  },
  {
    id: 'monitor-arm',
    name: 'Monitor arm',
    blurb: 'Gets the screen off the desk and up to where your neck wants it.',
    category: 'Workplace',
    icon: MonitorUp,
    choices: [
      { label: 'Single arm', cost: 480 },
      { label: 'Dual arm', cost: 760 },
    ],
    leadDays: 2,
    needs: 'Your desk number.',
    maxQuantity: 2,
  },
  {
    id: 'desk-move',
    name: 'Move my desk',
    blurb: 'A permanent seat change, with your kit carried over on the same day.',
    category: 'Workplace',
    icon: Move,
    choices: [{ label: 'Move to another desk', cost: 0 }],
    leadDays: 3,
    needs: 'Where you want to sit, and whether your team is moving too.',
    maxQuantity: 1,
  },
  {
    id: 'locker',
    name: 'A locker on my floor',
    blurb: 'Somewhere to leave a helmet, a laptop or a change of clothes.',
    category: 'Workplace',
    icon: Lock,
    choices: [{ label: 'Standard locker', cost: 0 }],
    leadDays: 1,
    needs: 'Which floor you want it on.',
    popular: true,
    maxQuantity: 1,
  },
  {
    id: 'team-plants',
    name: 'Plants for a team area',
    blurb: 'Greenery for a corner, watered by the same people who do the atrium.',
    category: 'Workplace',
    icon: Leaf,
    choices: [
      { label: 'Small set — three planters', cost: 900 },
      { label: 'Full corner', cost: 1800 },
    ],
    leadDays: 7,
    needs: 'The area, and whether it gets daylight.',
    maxQuantity: 2,
  },
  {
    id: 'employment-letter',
    name: 'Employment letter',
    blurb: 'Proof of employment for a bank, a landlord or an embassy.',
    category: 'People',
    icon: ScrollText,
    choices: [{ label: 'Standard letter', cost: 0 }],
    leadDays: 1,
    needs: 'Who it is addressed to, and whether it should show salary.',
    popular: true,
    maxQuantity: 1,
  },
  {
    id: 'training-course',
    name: 'Training course',
    blurb: 'An external course, paid from your team learning budget.',
    category: 'People',
    icon: GraduationCap,
    choices: [{ label: 'External course', cost: 6500 }],
    leadDays: 14,
    needs: 'The provider, the dates, and what you will bring back.',
    maxQuantity: 2,
  },
  {
    id: 'conference-ticket',
    name: 'Conference ticket',
    blurb: 'A pass for an industry conference, travel raised separately.',
    category: 'People',
    icon: Ticket,
    choices: [{ label: 'Full conference pass', cost: 12_000 }],
    leadDays: 21,
    needs: 'The conference, the dates, and who else is going.',
    maxQuantity: 2,
  },
  {
    id: 'business-cards',
    name: 'Business cards',
    blurb: 'A box of 200, printed on the current brand stock.',
    category: 'People',
    icon: CreditCard,
    choices: [{ label: 'Box of 200', cost: 260 }],
    leadDays: 5,
    needs: 'The title you want on them.',
    maxQuantity: 3,
  },
  {
    id: 'domestic-trip',
    name: 'Domestic trip',
    blurb: 'Flights and a hotel inside the Kingdom, booked by the travel desk.',
    category: 'Travel',
    icon: Plane,
    choices: [{ label: 'Return flight and two nights', cost: 3200 }],
    leadDays: 7,
    needs: 'The city, the dates, and the customer or project.',
    maxQuantity: 1,
  },
  {
    id: 'international-trip',
    name: 'International trip',
    blurb: 'Long-haul travel, hotel and the visa paperwork that goes with it.',
    category: 'Travel',
    icon: Plane,
    choices: [{ label: 'Return flight and four nights', cost: 14_500 }],
    leadDays: 14,
    needs: 'Passport expiry, the dates, and the reason for the trip.',
    maxQuantity: 1,
  },
  {
    id: 'airport-transfer',
    name: 'Airport transfer',
    blurb: 'A car to or from the airport, tied to a trip already booked.',
    category: 'Travel',
    icon: CarFront,
    choices: [{ label: 'One way', cost: 420 }],
    leadDays: 2,
    needs: 'The flight number and the pickup time.',
    maxQuantity: 4,
  },
  {
    id: 'replacement-badge',
    name: 'Replacement badge',
    blurb: 'A new access card when yours is lost, snapped or no longer reads.',
    category: 'Access',
    icon: BadgeCheck,
    choices: [{ label: 'Replacement card', cost: 120 }],
    leadDays: 1,
    needs: 'Whether the old one is lost or damaged — lost cards are voided today.',
    gate: { role: 'Security', approver: 'Adel Rashid' },
    popular: true,
    maxQuantity: 1,
  },
  {
    id: 'parking-permit',
    name: 'Parking permit',
    blurb: 'A named bay in the basement, billed monthly to your cost centre.',
    category: 'Access',
    icon: CarFront,
    choices: [{ label: 'Monthly bay', cost: 350 }],
    leadDays: 3,
    needs: 'Your plate number and the make of the car.',
    gate: { role: 'Security', approver: 'Adel Rashid' },
    maxQuantity: 1,
  },
  {
    id: 'after-hours',
    name: 'Out-of-hours floor access',
    blurb: 'Your badge opens a floor outside working hours, for a fixed window.',
    category: 'Access',
    icon: Moon,
    choices: [{ label: 'Two-week window', cost: 0 }],
    leadDays: 1,
    needs: 'The floor, the window, and why the work cannot wait for morning.',
    gate: { role: 'Security', approver: 'Adel Rashid' },
    maxQuantity: 1,
  },
];

export const serviceById = (id: string): Service | undefined =>
  SERVICES.find((service) => service.id === id);

export const cheapest = (service: Service): number =>
  Math.min(...service.choices.map((choice) => choice.cost));

export const costOf = (service: Service, choice: string): number =>
  service.choices.find((row) => row.label === choice)?.cost ?? cheapest(service);

const pending = (role: string, approver: string): ApprovalStep => ({
  role,
  approver,
  verdict: 'pending',
});

export const chainFor = (
  service: Service,
  requester: string,
  team: string,
  total: number,
): ApprovalStep[] => {
  const steps: ApprovalStep[] = [];

  if (total >= SIGNOFF_FLOOR) steps.push(pending('Line manager', managerOf(team, requester)));
  if (total >= FINANCE_FLOOR) steps.push(pending('Finance', FINANCE_APPROVER));
  if (service.gate && service.gate.approver !== requester)
    steps.push(pending(service.gate.role, service.gate.approver));

  return steps;
};

export const totalOf = (request: Pick<ServiceRequest, 'unitCost' | 'quantity'>): number =>
  request.unitCost * request.quantity;

export const nextApproval = (request: ServiceRequest): ApprovalStep | undefined =>
  request.chain.find((step) => step.verdict === 'pending');

export const awaits = (request: ServiceRequest, name: string): boolean =>
  request.stage === 'approval' && nextApproval(request)?.approver === name;

export const refusedAt = (request: ServiceRequest): ApprovalStep | undefined =>
  request.chain.find((step) => step.verdict === 'declined');
