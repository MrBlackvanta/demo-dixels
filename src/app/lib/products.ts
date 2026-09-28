import {
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calendar,
  Coffee,
  Compass,
  FileText,
  Image,
  LayoutGrid,
  LifeBuoy,
  Lock,
  Map,
  MessageSquare,
  Monitor,
  Puzzle,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  UserCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Persona =
  | 'Employee'
  | 'Reception'
  | 'Security'
  | 'Admin'
  | 'FacilityManager'
  | 'CafeteriaStaff'
  | 'DeliveryRunner';

export interface Product {
  id: string;
  name: string;
  descriptor: string;
  path: string;
  icon: LucideIcon;
  family: 'spaces' | 'people' | 'services' | 'platform' | 'core';
}

export const PRODUCTS = {
  dashboard: { id: 'dashboard', name: 'Today', descriptor: 'Your day at a glance', path: '/today', icon: LayoutGrid, family: 'core' },
  cortex: { id: 'cortex', name: 'Cortex', descriptor: 'The AI layer', path: '/cortex', icon: Sparkles, family: 'core' },

  spaceos: { id: 'spaceos', name: 'SpaceOS', descriptor: 'Space booking', path: '/spaceos', icon: BookOpen, family: 'spaces' },
  atmosphere: { id: 'atmosphere', name: 'Atmosphere', descriptor: 'Smart controls', path: '/atmosphere', icon: Sliders, family: 'spaces' },
  pathfinder: { id: 'pathfinder', name: 'Pathfinder', descriptor: 'Wayfinding', path: '/pathfinder', icon: Compass, family: 'spaces' },
  twinspace: { id: 'twinspace', name: 'TwinSpace', descriptor: 'Digital twin', path: '/twinspace', icon: Map, family: 'spaces' },
  buildingops: { id: 'buildingops', name: 'Building Ops', descriptor: 'Facility automation', path: '/building-ops', icon: Building, family: 'spaces' },

  visitflow: { id: 'visitflow', name: 'VisitFlow', descriptor: 'Visitor management', path: '/visitflow', icon: Users, family: 'people' },
  gather: { id: 'gather', name: 'Gather', descriptor: 'Events', path: '/gather', icon: Calendar, family: 'people' },
  tribes: { id: 'tribes', name: 'Tribes', descriptor: 'Communities', path: '/tribes', icon: MessageSquare, family: 'people' },

  nourish: { id: 'nourish', name: 'Nourish', descriptor: 'Smart café', path: '/nourish', icon: Coffee, family: 'services' },
  omniserve: { id: 'omniserve', name: 'OmniServe', descriptor: 'Service hub', path: '/omniserve', icon: LifeBuoy, family: 'services' },
  resolve: { id: 'resolve', name: 'Resolve', descriptor: 'Support center', path: '/resolve', icon: Sparkles, family: 'services' },
  taskflow: { id: 'taskflow', name: 'TaskFlow', descriptor: 'Work management', path: '/taskflow', icon: Zap, family: 'services' },
  calendar: { id: 'calendar', name: 'My Calendar', descriptor: 'Day manager', path: '/calendar', icon: Calendar, family: 'services' },

  livecanvas: { id: 'livecanvas', name: 'LiveCanvas', descriptor: 'Smart signage', path: '/livecanvas', icon: Monitor, family: 'platform' },
  content: { id: 'content', name: 'Content', descriptor: 'CMS', path: '/content', icon: FileText, family: 'platform' },
  vault: { id: 'vault', name: 'Vault', descriptor: 'Digital assets', path: '/vault', icon: Image, family: 'platform' },
  nexus: { id: 'nexus', name: 'Nexus', descriptor: 'Integrations', path: '/nexus', icon: Puzzle, family: 'platform' },
  flow: { id: 'flow', name: 'Flow', descriptor: 'Workflow engine', path: '/flow', icon: Workflow, family: 'platform' },
  identity: { id: 'identity', name: 'Identity', descriptor: 'Access control', path: '/identity', icon: Lock, family: 'platform' },

  security: { id: 'security', name: 'Security Ops', descriptor: 'Monitoring', path: '/security', icon: Shield, family: 'platform' },
  vmsadmin: { id: 'vmsadmin', name: 'VisitFlow Admin', descriptor: 'Visitor settings', path: '/visitflow/admin', icon: UserCheck, family: 'platform' },
  analytics: { id: 'analytics', name: 'Analytics', descriptor: 'Insights', path: '/analytics', icon: BarChart3, family: 'platform' },
  settings: { id: 'settings', name: 'Settings', descriptor: 'System config', path: '/settings', icon: Settings, family: 'platform' },
  notifications: { id: 'notifications', name: 'Notifications', descriptor: 'Activity', path: '/notifications', icon: Bell, family: 'core' },
} as const satisfies Record<string, Product>;

export type ProductId = keyof typeof PRODUCTS;

export interface NavGroup {
  title: string;
  items: Product[];
}

const P = PRODUCTS;

export const NAV_BY_PERSONA: Record<Persona, NavGroup[]> = {
  Employee: [
    { title: 'My day', items: [P.dashboard, P.calendar, P.taskflow, P.atmosphere] },
    { title: 'Spaces & comfort', items: [P.spaceos, P.pathfinder] },
    { title: 'People & belonging', items: [P.visitflow, P.gather, P.tribes] },
    { title: 'Services', items: [P.nourish, P.omniserve, P.resolve] },
  ],
  Admin: [
    { title: 'Overview', items: [P.dashboard, P.analytics, P.settings] },
    { title: 'Operations', items: [P.buildingops, P.twinspace, P.security, P.vmsadmin] },
    { title: 'Content & experience', items: [P.content, P.vault, P.livecanvas, P.tribes] },
    { title: 'Platform', items: [P.identity, P.flow, P.nexus] },
  ],
  FacilityManager: [
    { title: 'Operations', items: [P.dashboard, P.buildingops, P.spaceos, P.twinspace] },
    { title: 'Experience', items: [P.livecanvas, P.gather, P.tribes] },
    { title: 'Services', items: [P.nourish, P.omniserve, P.resolve] },
    { title: 'Security', items: [P.security, P.visitflow] },
  ],
  Reception: [{ title: 'Front desk', items: [P.visitflow, P.pathfinder, P.gather] }],
  Security: [{ title: 'Command center', items: [P.security, P.visitflow, P.twinspace] }],
  CafeteriaStaff: [{ title: 'Kitchen', items: [P.nourish, P.omniserve] }],
  DeliveryRunner: [{ title: 'Delivery', items: [P.nourish] }],
};

export const PERSONA_LABELS: Record<Persona, string> = {
  Employee: 'Employee',
  Reception: 'Reception',
  Security: 'Security',
  Admin: 'Administrator',
  FacilityManager: 'Facility manager',
  CafeteriaStaff: 'Café staff',
  DeliveryRunner: 'Delivery runner',
};

export const ALL_PRODUCTS: Product[] = Object.values(PRODUCTS);

export const productByPath = (path: string): Product | undefined =>
  ALL_PRODUCTS.find((p) => p.path === path) ??
  ALL_PRODUCTS.filter((p) => path.startsWith(p.path)).sort((a, b) => b.path.length - a.path.length)[0];
