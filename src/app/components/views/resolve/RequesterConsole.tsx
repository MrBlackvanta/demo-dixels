import { useMemo, useState } from 'react';
import { BookOpenCheck, CircleCheckBig, CircleDot, Inbox, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, tickets as ticketsCol } from '../../../lib/data';
import { dueFrom, slaLabel } from '../../../lib/sla';
import type { Ticket, TicketPriority, TicketTeam } from '../../../lib/data';
import { EmptyState } from '../../shell/EmptyState';
import { TicketCard } from './TicketCard';
import { TicketDialog } from './TicketDialog';
import { TicketSheet } from './TicketSheet';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import {
  ARTICLES,
  NO_FILTERS,
  PRIORITY_TARGET,
  TEAMS,
  TEAM_BLURB,
  TEAM_ICON,
  byNewest,
  isMine,
  matchesFilters,
  needsRating,
  rateWith,
  reopenWith,
  withNote,
} from './support';
import type { Filters } from './support';

const me = CURRENT_USER.name;

export function RequesterConsole() {
  const allTickets = useCollection(ticketsCol);

  const [lens, setLens] = useState('live');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Ticket | null>(null);
  const [raising, setRaising] = useState(false);

  const mine = useMemo(
    () => allTickets.filter((ticket) => isMine(ticket, me)),
    [allTickets],
  );

  const live = useMemo(() => mine.filter((ticket) => ticket.status !== 'resolved'), [mine]);
  const done = useMemo(() => mine.filter((ticket) => ticket.status === 'resolved'), [mine]);
  const waiting = useMemo(() => live.filter((ticket) => ticket.status === 'waiting'), [live]);
  const unrated = useMemo(() => done.filter(needsRating), [done]);

  const shown = useMemo(
    () => (lens === 'live' ? live : done).filter((t) => matchesFilters(t, filters)).sort(byNewest),
    [lens, live, done, filters],
  );

  const lenses: Lens[] = [
    { id: 'live', label: 'Open', icon: CircleDot, count: live.length },
    { id: 'done', label: 'History', icon: CircleCheckBig, count: unrated.length },
    { id: 'help', label: 'Answers', icon: BookOpenCheck },
  ];

  const stats = [
    { label: 'Open right now', value: live.length, tone: 'brand' as const },
    { label: 'Waiting on your reply', value: waiting.length, tone: 'warning' as const },
    { label: 'Sorted for you', value: done.length, tone: 'green' as const },
  ];

  const sync = (id: string, patch: Partial<Ticket>) => {
    const updated = ticketsCol.update(id, patch);
    setOpen((sheet) => (sheet && sheet.id === id ? updated ?? sheet : sheet));
  };

  const note = (ticket: Ticket, body: string) => {
    sync(ticket.id, withNote(ticket, me, body));
    toast.success(`Added to ${ticket.ref}`, {
      description: ticket.assignee ? `${ticket.assignee} will see it.` : 'It is on the thread.',
    });
  };

  const rate = (ticket: Ticket, score: number) => {
    sync(ticket.id, rateWith(ticket, score));
    toast.success(`Thanks — ${score} out of 5`, {
      description: `${ticket.assignee ?? ticket.team} will see this on ${ticket.ref}.`,
    });
  };

  const reopen = (ticket: Ticket, reason: string) => {
    sync(ticket.id, reopenWith(ticket, me, reason));
    setLens('live');
    toast.success(`${ticket.ref} is open again`, {
      description: `Back with ${ticket.assignee ?? ticket.team}.`,
    });
  };

  const raise = (draft: {
    subject: string;
    detail: string;
    team: TicketTeam;
    category: string;
    spaceId: string;
    priority: TicketPriority;
    location: string;
  }) => {
    const openedAt = new Date().toISOString();
    const highest = allTickets.reduce((top, row) => Math.max(top, Number(row.ref.slice(4)) || 0), 1039);
    const created = ticketsCol.create({
      ref: `RSV-${highest + 1}`,
      subject: draft.subject.trim(),
      detail: draft.detail.trim(),
      category: draft.category,
      team: draft.team,
      location: draft.location,
      priority: draft.priority,
      status: 'open',
      requester: me,
      openedAt,
      dueAt: dueFrom(openedAt, draft.priority),
      spaceId: draft.spaceId || undefined,
      thread: [{ author: 'Resolve', body: `${me} raised this request`, at: openedAt, kind: 'event' }],
    });

    setRaising(false);
    setLens('live');
    toast.success(`${created.ref} is with the ${draft.team} team`, {
      description: `They aim to be with you ${PRIORITY_TARGET[draft.priority]} — ${slaLabel(created)}.`,
      action: { label: 'Undo', onClick: () => ticketsCol.remove(created.id) },
    });
  };

  const deflect = (title: string) => {
    setRaising(false);
    toast.success('Glad that sorted it', {
      description: `${title} — nothing raised, so nobody is chasing a ticket that did not need one.`,
    });
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">Resolve · {CURRENT_USER.building}</p>
          <h2 className="dx-h2 text-balance">Something in your way?</h2>
          <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
            Raise it once and watch it move. Every request carries the time the team is working to.
          </p>
        </div>

        <button type="button" onClick={() => setRaising(true)} className="dx-btn-primary">
          <Plus size={15} aria-hidden="true" />
          Raise a request
        </button>
      </div>

      <section aria-label="Your requests at a glance" className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <CountUp
              value={stat.value}
              className={cn(
                'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'warning' && 'text-warning',
                stat.tone === 'green' && 'text-grn-500',
              )}
            />
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="resolve-heading" className="dx-card overflow-hidden">
        <h3 id="resolve-heading" className="sr-only">
          Your requests
        </h3>

        <Toolbar
          lenses={lenses}
          lens={lens}
          onLens={setLens}
          filters={filters}
          onFilters={setFilters}
          searchLabel="Search your requests"
          withFilters={lens !== 'help'}
        />

        {lens === 'help' ? (
          <div className="grid gap-3 bg-nt-50 p-4 sm:grid-cols-2">
            {TEAMS.map((team) => {
              const Glyph = TEAM_ICON[team];
              const answers = ARTICLES.filter((article) => article.team === team);
              if (answers.length === 0) return null;

              return (
                <article key={team} className="dx-card px-5 py-4">
                  <p className="flex items-center gap-2 text-body-lg font-medium text-ink">
                    <Glyph size={16} aria-hidden="true" className="text-brand-600" />
                    {team}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-ink-muted">{TEAM_BLURB[team]}</p>

                  <ul className="mt-3 space-y-3 border-t border-line pt-3">
                    {answers.map((article) => (
                      <li key={article.id}>
                        <p className="text-body font-medium text-ink">{article.title}</p>
                        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                          {article.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              lens === 'live'
                ? mine.length === 0
                  ? 'Nothing raised yet.'
                  : 'Nothing open — everything you raised is sorted.'
                : 'Nothing resolved matches that.'
            }
            actionLabel={filters.search || lens === 'done' ? 'Clear the search' : 'Raise a request'}
            onAction={() =>
              filters.search || lens === 'done' ? setFilters(NO_FILTERS) : setRaising(true)
            }
          />
        ) : (
          <ul className="space-y-3 bg-nt-50 p-4">
            {shown.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onOpen={setOpen} />
            ))}
          </ul>
        )}
      </section>

      {open && (
        <TicketSheet
          ticket={open}
          me={me}
          onClose={() => setOpen(null)}
          onNote={note}
          onRate={rate}
          onReopen={reopen}
        />
      )}

      {raising && (
        <TicketDialog
          mine={mine}
          onClose={() => setRaising(false)}
          onCreate={raise}
          onDeflect={deflect}
        />
      )}
    </>
  );
}
