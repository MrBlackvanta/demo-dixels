import { useMemo, useState } from 'react';
import { CircleCheckBig, Gauge, Inbox, ListFilter, Timer } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { tickets as ticketsCol } from '../../../lib/data';
import { minutesLeft, slaLabel, slaState } from '../../../lib/sla';
import type { Ticket, TicketPriority } from '../../../lib/data';
import { QueueEmpty } from './QueueEmpty';
import { QueueRow } from './QueueRow';
import { TicketSheet } from './TicketSheet';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import {
  AGENTS,
  NO_FILTERS,
  PRIORITY_TARGET,
  assignTo,
  byNewest,
  byUrgency,
  escalateTo,
  holdFor,
  matchesFilters,
  resolveWith,
  withNote,
} from './support';
import type { Filters } from './support';

const onDuty = (ticket: Ticket): string => ticket.assignee ?? AGENTS[ticket.team][0];

export function AgentConsole() {
  const allTickets = useCollection(ticketsCol);

  const [lens, setLens] = useState('queue');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Ticket | null>(null);

  const live = useMemo(
    () => allTickets.filter((ticket) => ticket.status !== 'resolved'),
    [allTickets],
  );
  const done = useMemo(
    () => allTickets.filter((ticket) => ticket.status === 'resolved'),
    [allTickets],
  );

  const loose = useMemo(() => live.filter((ticket) => !ticket.assignee), [live]);
  const held = useMemo(() => live.filter((ticket) => ticket.status === 'waiting'), [live]);
  const breached = useMemo(
    () => live.filter((ticket) => slaState(ticket) === 'breached'),
    [live],
  );
  const soon = useMemo(
    () =>
      live.filter(
        (ticket) =>
          slaState(ticket) !== 'held' && minutesLeft(ticket) >= 0 && minutesLeft(ticket) <= 60,
      ),
    [live],
  );

  const rated = useMemo(
    () => done.filter((ticket) => ticket.rating !== undefined),
    [done],
  );
  const happy = rated.length
    ? Math.round((rated.filter((ticket) => (ticket.rating ?? 0) >= 4).length / rated.length) * 100)
    : 0;

  const pool = lens === 'loose' ? loose : lens === 'held' ? held : lens === 'done' ? done : live;

  const shown = useMemo(
    () =>
      pool
        .filter((ticket) => matchesFilters(ticket, filters))
        .sort(lens === 'done' ? byNewest : byUrgency),
    [pool, filters, lens],
  );

  const lenses: Lens[] = [
    { id: 'queue', label: 'Queue', icon: ListFilter, count: live.length },
    { id: 'loose', label: 'Unassigned', icon: Inbox, count: loose.length },
    { id: 'held', label: 'Waiting', icon: Timer, count: held.length },
    { id: 'done', label: 'Resolved', icon: CircleCheckBig },
  ];

  const stats = [
    { label: 'Past their target', value: breached.length, suffix: '', tone: 'danger' as const },
    { label: 'Nobody has picked up', value: loose.length, suffix: '', tone: 'warning' as const },
    { label: 'Due within the hour', value: soon.length, suffix: '', tone: 'brand' as const },
    { label: 'Rated 4 or better', value: happy, suffix: '%', tone: 'green' as const },
  ];

  const sync = (id: string, patch: Partial<Ticket>) => {
    const updated = ticketsCol.update(id, patch);
    setOpen((sheet) => (sheet && sheet.id === id ? updated ?? sheet : sheet));
  };

  const assign = (ticket: Ticket, agent: string) => {
    if (agent === ticket.assignee) return;
    sync(ticket.id, assignTo(ticket, agent));
    toast.success(`${ticket.ref} is with ${agent}`, {
      description: `${ticket.subject} · ${slaLabel(ticket)}`,
    });
  };

  const escalate = (ticket: Ticket, priority: TicketPriority) => {
    if (priority === ticket.priority) return;
    const before = { priority: ticket.priority, dueAt: ticket.dueAt, thread: ticket.thread };
    sync(ticket.id, escalateTo(ticket, priority));
    toast.success(`${ticket.ref} moved to ${priority}`, {
      description: `The target is now ${PRIORITY_TARGET[priority]} from when it was raised.`,
      action: { label: 'Undo', onClick: () => sync(ticket.id, before) },
    });
  };

  const hold = (ticket: Ticket, question: string) => {
    sync(ticket.id, holdFor(ticket, onDuty(ticket), question));
    toast.success(`Waiting on ${ticket.requester}`, {
      description: 'The target clock pauses until they reply.',
    });
  };

  const close = (ticket: Ticket, summary: string) => {
    const before = {
      status: ticket.status,
      resolvedAt: ticket.resolvedAt,
      thread: ticket.thread,
    };
    sync(ticket.id, resolveWith(ticket, onDuty(ticket), summary));
    toast.success(`${ticket.ref} resolved`, {
      description: `${ticket.requester} can rate it now.`,
      action: { label: 'Undo', onClick: () => sync(ticket.id, before) },
    });
  };

  const note = (ticket: Ticket, body: string) => {
    sync(ticket.id, withNote(ticket, onDuty(ticket), body));
    toast.success(`Replied on ${ticket.ref}`);
  };

  return (
    <>
      <div className="mb-7">
        <p className="dx-eyebrow mb-2">Resolve · service desk</p>
        <h2 className="dx-h2 text-balance">Everything waiting on somebody</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
          One queue across five teams, ordered by what runs out of time first.
        </p>
      </div>

      <section aria-label="Queue health" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <p
              className={cn(
                'text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'danger' && 'text-danger',
                stat.tone === 'warning' && 'text-warning',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'green' && 'text-grn-500',
              )}
            >
              <CountUp value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="queue-heading" className="dx-card overflow-hidden">
        <h3 id="queue-heading" className="sr-only">
          The queue
        </h3>

        <Toolbar
          lenses={lenses}
          lens={lens}
          onLens={setLens}
          filters={filters}
          onFilters={setFilters}
          searchLabel="Search by subject, person or reference"
          withFilters
        />

        {shown.length === 0 ? (
          <QueueEmpty
            icon={Gauge}
            title={
              lens === 'loose'
                ? 'Everything live has an owner.'
                : lens === 'held'
                  ? 'Nothing is waiting on a requester.'
                  : 'Nothing matches those filters.'
            }
            actionLabel="Clear the filters"
            onAction={() => setFilters(NO_FILTERS)}
          />
        ) : (
          <ul>
            {shown.map((ticket) => (
              <QueueRow
                key={ticket.id}
                ticket={ticket}
                onOpen={setOpen}
                onTake={(row) => assign(row, onDuty(row))}
              />
            ))}
          </ul>
        )}
      </section>

      {open && (
        <TicketSheet
          ticket={open}
          me={onDuty(open)}
          onClose={() => setOpen(null)}
          onNote={note}
          onAssign={assign}
          onEscalate={escalate}
          onHold={hold}
          onResolve={close}
        />
      )}
    </>
  );
}
