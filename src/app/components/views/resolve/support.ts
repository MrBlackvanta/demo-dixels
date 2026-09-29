import { Coffee, Laptop, MonitorPlay, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SLA_HOURS, dueFrom, minutesLeft, slaState } from '../../../lib/sla';
import type {
  Entry,
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketTeam,
} from '../../../lib/data';

export const TEAMS: TicketTeam[] = ['IT', 'Workplace', 'AV', 'Security', 'Catering'];

export const TEAM_ICON: Record<TicketTeam, LucideIcon> = {
  IT: Laptop,
  Workplace: Wrench,
  AV: MonitorPlay,
  Security: ShieldCheck,
  Catering: Coffee,
};

export const TEAM_BLURB: Record<TicketTeam, string> = {
  IT: 'Laptops, accounts, networks and the software you sign in to.',
  Workplace: 'Comfort, furniture, cleaning, supplies and the building itself.',
  AV: 'Room displays, microphones, cameras and anything on a call.',
  Security: 'Badges, doors, parking and access to a floor.',
  Catering: 'The café, the pantries and everything they run out of.',
};

export const CATEGORIES: Record<TicketTeam, string[]> = {
  IT: ['Network', 'Laptop', 'Hardware', 'Software', 'Account'],
  Workplace: ['Comfort', 'Furniture', 'Cleaning', 'Supplies', 'Building'],
  AV: ['Meeting room AV', 'Display', 'Video call'],
  Security: ['Badge', 'Access', 'Parking'],
  Catering: ['Café', 'Pantry'],
};

export const AGENTS: Record<TicketTeam, string[]> = {
  IT: ['Bassem Riad', 'Sami Kamal'],
  Workplace: ['Yousef Mansour', 'Waleed Tantawy'],
  AV: ['Ziad Morsi', 'Bassem Riad'],
  Security: ['Adel Rashid'],
  Catering: ['Hassan Iqbal'],
};

export const PRIORITIES: TicketPriority[] = ['urgent', 'high', 'medium', 'low'];

export const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_TONE: Record<TicketPriority, string> = {
  urgent: 'bg-danger-bg text-danger',
  high: 'bg-warning-bg text-warning',
  medium: 'bg-brand-50 text-brand-700',
  low: 'bg-nt-100 text-ink-muted',
};

export const PRIORITY_TARGET: Record<TicketPriority, string> = {
  urgent: 'within the hour',
  high: 'within 4 hours',
  medium: 'within 8 hours',
  low: 'within a working day',
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  waiting: 'Waiting on you',
  resolved: 'Resolved',
};

export const STATUS_TONE: Record<TicketStatus, string> = {
  open: 'bg-nt-100 text-ink',
  'in-progress': 'bg-brand-50 text-brand-700',
  waiting: 'bg-warning-bg text-warning',
  resolved: 'bg-grn-100 text-grn-700',
};

export const SLA_TONE: Record<string, { chip: string; bar: string }> = {
  breached: { chip: 'bg-danger-bg text-danger', bar: 'bg-danger' },
  'at-risk': { chip: 'bg-warning-bg text-warning', bar: 'bg-warning' },
  'on-track': { chip: 'bg-nt-100 text-ink-muted', bar: 'bg-brand-400' },
  held: { chip: 'bg-nt-100 text-ink-subtle', bar: 'bg-nt-300' },
  met: { chip: 'bg-grn-100 text-grn-700', bar: 'bg-grn-500' },
  missed: { chip: 'bg-nt-100 text-ink-muted', bar: 'bg-nt-400' },
};

export const isLive = (ticket: Ticket): boolean => ticket.status !== 'resolved';

export const isMine = (ticket: Ticket, name: string): boolean => ticket.requester === name;

export const needsRating = (ticket: Ticket): boolean =>
  ticket.status === 'resolved' && ticket.rating === undefined;

export const slaProgress = (ticket: Ticket): number => {
  const window = SLA_HOURS[ticket.priority] * 60;
  const used = window - minutesLeft(ticket);
  return Math.max(0, Math.min(100, Math.round((used / window) * 100)));
};

const entry = (author: string, body: string, kind: 'note' | 'event') => ({
  author,
  body,
  at: new Date().toISOString(),
  kind,
});

export const withNote = (ticket: Ticket, author: string, body: string): Partial<Ticket> => ({
  thread: [...ticket.thread, entry(author, body, 'note')],
  status: ticket.status === 'waiting' && author === ticket.requester ? 'in-progress' : ticket.status,
});

export const assignTo = (ticket: Ticket, agent: string): Partial<Ticket> => ({
  assignee: agent,
  status: ticket.status === 'open' ? 'in-progress' : ticket.status,
  thread: [...ticket.thread, entry('Resolve', `${agent} took the ticket`, 'event')],
});

export const escalateTo = (ticket: Ticket, priority: TicketPriority): Partial<Ticket> => ({
  priority,
  dueAt: dueFrom(ticket.openedAt, priority),
  thread: [
    ...ticket.thread,
    entry('Resolve', `Priority moved to ${priority} — target is ${PRIORITY_TARGET[priority]}`, 'event'),
  ],
});

export const holdFor = (ticket: Ticket, actor: string, question: string): Partial<Ticket> => ({
  status: 'waiting',
  thread: [
    ...ticket.thread,
    entry(actor, question, 'note'),
    entry('Resolve', `Waiting on ${ticket.requester}`, 'event'),
  ],
});

export const resolveWith = (ticket: Ticket, actor: string, summary: string): Partial<Ticket> => ({
  status: 'resolved',
  resolvedAt: new Date().toISOString(),
  thread: [
    ...ticket.thread,
    ...(summary ? [entry(actor, summary, 'note')] : []),
    entry('Resolve', `${actor} resolved the ticket`, 'event'),
  ],
});

export const reopenWith = (ticket: Ticket, actor: string, reason: string): Partial<Ticket> => ({
  status: 'in-progress',
  resolvedAt: undefined,
  rating: undefined,
  thread: [
    ...ticket.thread,
    entry(actor, reason, 'note'),
    entry('Resolve', `${actor} reopened the ticket`, 'event'),
  ],
});

export const rateWith = (ticket: Ticket, score: number): Partial<Ticket> => ({
  rating: score,
  thread: [...ticket.thread, entry('Resolve', `${ticket.requester} rated this ${score} out of 5`, 'event')],
});

export const byUrgency = (a: Ticket, b: Ticket): number =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
  Number(slaState(a) === 'held') - Number(slaState(b) === 'held') ||
  minutesLeft(a) - minutesLeft(b);

export const byDeadline = (a: Ticket, b: Ticket): number => minutesLeft(a) - minutesLeft(b);

export const byNewest = (a: Ticket, b: Ticket): number => b.openedAt.localeCompare(a.openedAt);

export const lastWord = (ticket: Ticket) => ticket.thread[ticket.thread.length - 1];

export interface Filters {
  search: string;
  team: TicketTeam | 'all';
  priority: TicketPriority | 'all';
  breachedOnly: boolean;
}

export const NO_FILTERS: Filters = {
  search: '',
  team: 'all',
  priority: 'all',
  breachedOnly: false,
};

export const activeFilterCount = (filters: Filters): number =>
  (filters.team === 'all' ? 0 : 1) +
  (filters.priority === 'all' ? 0 : 1) +
  (filters.breachedOnly ? 1 : 0);

export const matchesFilters = (ticket: Ticket, filters: Filters): boolean => {
  if (filters.team !== 'all' && ticket.team !== filters.team) return false;
  if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
  if (filters.breachedOnly && slaState(ticket) !== 'breached') return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [
    ticket.ref,
    ticket.subject,
    ticket.detail,
    ticket.category,
    ticket.location,
    ticket.requester,
    ticket.assignee ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
};

export interface Article {
  id: string;
  title: string;
  team: TicketTeam;
  body: string;
  keywords: string[];
}

export const articlesFrom = (entries: Entry[]): Article[] =>
  entries
    .filter(
      (entry) =>
        entry.status === 'live' && entry.surfaces.includes('resolve') && entry.team !== undefined,
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      team: entry.team as TicketTeam,
      body: entry.body,
      keywords: entry.keywords,
    }));

export const suggest = (articles: Article[], text: string): Article[] => {
  const words = text
    .toLowerCase()
    .split(/[^a-z-]+/)
    .filter((word) => word.length > 2);
  if (words.length === 0) return [];

  return articles
    .map((article) => ({
      article,
      score: article.keywords.filter((key) => words.some((word) => key.includes(word))).length,
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((hit) => hit.article);
};
