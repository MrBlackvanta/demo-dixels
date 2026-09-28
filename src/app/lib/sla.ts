import type { Ticket, TicketPriority } from './data';

export const SLA_HOURS: Record<TicketPriority, number> = {
  urgent: 1,
  high: 4,
  medium: 8,
  low: 24,
};

export type SlaState = 'breached' | 'at-risk' | 'on-track' | 'held' | 'met' | 'missed';

export const dueFrom = (openedAt: string, priority: TicketPriority): string =>
  new Date(new Date(openedAt).getTime() + SLA_HOURS[priority] * 3_600_000).toISOString();

export const minutesLeft = (ticket: Ticket): number =>
  Math.round((new Date(ticket.dueAt).getTime() - Date.now()) / 60_000);

export const slaState = (ticket: Ticket): SlaState => {
  if (ticket.status === 'resolved') {
    const closed = new Date(ticket.resolvedAt ?? ticket.dueAt).getTime();
    return closed <= new Date(ticket.dueAt).getTime() ? 'met' : 'missed';
  }

  if (ticket.status === 'waiting') return 'held';

  const left = minutesLeft(ticket);
  if (left < 0) return 'breached';
  return left <= SLA_HOURS[ticket.priority] * 15 ? 'at-risk' : 'on-track';
};

export const formatSpan = (minutes: number): string => {
  const total = Math.abs(minutes);
  if (total < 60) return `${total}m`;

  const hours = Math.floor(total / 60);
  if (hours < 24) return total % 60 === 0 ? `${hours}h` : `${hours}h ${total % 60}m`;

  const days = Math.floor(hours / 24);
  return hours % 24 === 0 ? `${days}d` : `${days}d ${hours % 24}h`;
};

export const slaLabel = (ticket: Ticket): string => {
  const state = slaState(ticket);
  if (state === 'met') return 'Met the target';
  if (state === 'missed') return 'Missed the target';
  if (state === 'held') return 'Clock paused';

  const left = minutesLeft(ticket);
  return left < 0 ? `${formatSpan(left)} over` : `${formatSpan(left)} left`;
};
