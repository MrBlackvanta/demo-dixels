import { CircleCheck, CircleDashed, CircleDot, Eye, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { todayKey } from '../../../lib/format';
import { PRIORITY_RANK, isOverdue, openBlockers, remainingOf } from '../../../lib/workload';
import type { Health } from '../../../lib/workload';
import type { Task, TaskPriority, TaskState } from '../../../lib/data';

export const STATE_LABEL: Record<TaskState, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  doing: 'Doing',
  review: 'In review',
  done: 'Done',
};

export const STATE_HINT: Record<TaskState, string> = {
  backlog: 'Not started, not promised',
  todo: 'Ready to pick up',
  doing: 'Someone is on it now',
  review: 'With someone else to check',
  done: 'Finished',
};

export const STATE_ICON: Record<TaskState, LucideIcon> = {
  backlog: Inbox,
  todo: CircleDashed,
  doing: CircleDot,
  review: Eye,
  done: CircleCheck,
};

export const STATE_TONE: Record<TaskState, string> = {
  backlog: 'bg-nt-100 text-ink-muted',
  todo: 'bg-nt-100 text-ink',
  doing: 'bg-brand-50 text-brand-700',
  review: 'bg-warning-bg text-warning',
  done: 'bg-grn-50 text-grn-700',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const PRIORITY_TONE: Record<TaskPriority, string> = {
  critical: 'bg-danger',
  high: 'bg-warning',
  normal: 'bg-brand-400',
  low: 'bg-line-strong',
};

export const HEALTH_LABEL: Record<Health, string> = {
  shipped: 'Shipped',
  blocked: 'Blocked',
  'at-risk': 'At risk',
  'on-track': 'On track',
};

export const HEALTH_TONE: Record<Health, string> = {
  shipped: 'bg-grn-50 text-grn-700',
  blocked: 'bg-danger-bg text-danger',
  'at-risk': 'bg-warning-bg text-warning',
  'on-track': 'bg-brand-50 text-brand-700',
};

export const byDue = (a: Task, b: Task): number =>
  a.due.localeCompare(b.due) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];

export const byUrgency = (a: Task, b: Task): number =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.due.localeCompare(b.due);

export const bySize = (a: Task, b: Task): number => remainingOf(b) - remainingOf(a);

export interface Filters {
  search: string;
  projectId: string;
  owner: string;
  priority: TaskPriority | 'all';
  blockedOnly: boolean;
}

export const NO_FILTERS: Filters = {
  search: '',
  projectId: 'all',
  owner: 'all',
  priority: 'all',
  blockedOnly: false,
};

export const activeFilterCount = (filters: Filters): number =>
  (filters.projectId === 'all' ? 0 : 1) +
  (filters.owner === 'all' ? 0 : 1) +
  (filters.priority === 'all' ? 0 : 1) +
  (filters.blockedOnly ? 1 : 0);

export const matchesFilters = (task: Task, filters: Filters, all: Task[]): boolean => {
  const needle = filters.search.trim().toLowerCase();
  if (needle && !`${task.ref} ${task.title} ${task.detail} ${task.owner} ${task.tags.join(' ')}`.toLowerCase().includes(needle))
    return false;
  if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false;
  if (filters.owner !== 'all' && task.owner !== filters.owner) return false;
  if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
  if (filters.blockedOnly && openBlockers(task, all).length === 0) return false;
  return true;
};

export type Bucket = 'late' | 'today' | 'week' | 'later';

export const BUCKET_LABEL: Record<Bucket, string> = {
  late: 'Overdue',
  today: 'Due today',
  week: 'The rest of this week',
  later: 'After that',
};

export const bucketOf = (task: Task, weekEnd: string): Bucket => {
  if (isOverdue(task)) return 'late';
  if (task.due === todayKey()) return 'today';
  return task.due <= weekEnd ? 'week' : 'later';
};
