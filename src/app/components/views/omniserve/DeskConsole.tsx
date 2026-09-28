import { useMemo, useState } from 'react';
import { Boxes, CheckCheck, Gauge, PackageCheck, Stamp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, requests as requestsCol } from '../../../lib/data';
import { money } from '../../../lib/format';
import { SERVICE_CATEGORIES, CATEGORY_ICON, nextApproval, totalOf } from '../../../lib/catalogue';
import type { ServiceRequest } from '../../../lib/data';
import { RequestRow } from './RequestRow';
import { RequestSheet } from './RequestSheet';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import {
  NO_FILTERS,
  byOldest,
  byValue,
  committed,
  deliverBy,
  matchesFilters,
  readyBy,
  takeBy,
  withNote,
} from './desk';
import type { Filters } from './desk';

const desk = CURRENT_USER.name;

export function DeskConsole() {
  const all = useCollection(requestsCol);

  const [lens, setLens] = useState('sign');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<ServiceRequest | null>(null);

  const waiting = useMemo(() => all.filter((row) => row.stage === 'approval'), [all]);
  const arranging = useMemo(() => all.filter((row) => row.stage === 'arranging'), [all]);
  const ready = useMemo(() => all.filter((row) => row.stage === 'ready'), [all]);
  const closed = useMemo(
    () => all.filter((row) => row.stage === 'delivered' || row.stage === 'declined'),
    [all],
  );
  const loose = useMemo(() => arranging.filter((row) => !row.handler), [arranging]);

  const spend = useMemo(() => committed(all), [all]);
  const pipeline = useMemo(() => committed([...waiting, ...arranging, ...ready]), [
    waiting,
    arranging,
    ready,
  ]);

  const byCategory = useMemo(
    () =>
      SERVICE_CATEGORIES.map((category) => {
        const rows = all.filter((row) => row.category === category);
        return { category, value: committed(rows), count: rows.length };
      }).sort((a, b) => b.value - a.value),
    [all],
  );

  const peak = byCategory[0]?.value ?? 1;

  const shown = useMemo(() => {
    const rows =
      lens === 'sign' ? waiting : lens === 'work' ? arranging : lens === 'ready' ? ready : closed;

    const sorted =
      lens === 'sign'
        ? [...rows].sort(byValue)
        : [...rows].sort(
            (a, b) => Number(Boolean(a.handler)) - Number(Boolean(b.handler)) || byOldest(a, b),
          );

    return sorted.filter((row) => matchesFilters(row, filters, desk));
  }, [lens, waiting, arranging, ready, closed, filters]);

  const lenses: Lens[] = [
    { id: 'sign', label: 'Awaiting approval', icon: Stamp, count: waiting.length },
    { id: 'work', label: 'To arrange', icon: Boxes, count: arranging.length },
    { id: 'ready', label: 'Ready', icon: PackageCheck, count: ready.length },
    { id: 'done', label: 'Settled', icon: CheckCheck },
  ];

  const stats = [
    { label: 'Stuck in approval', value: waiting.length, tone: 'warning' as const, money: false },
    { label: 'Nobody has picked up', value: loose.length, tone: 'brand' as const, money: false },
    { label: 'Ready for collection', value: ready.length, tone: 'green' as const, money: false },
    { label: 'Committed so far', value: spend, tone: 'ink' as const, money: true },
  ];

  const sync = (id: string, patch: Partial<ServiceRequest>) => {
    const updated = requestsCol.update(id, patch);
    setOpen((sheet) => (sheet && sheet.id === id ? updated ?? sheet : sheet));
  };

  const note = (request: ServiceRequest, body: string) => {
    sync(request.id, withNote(request, desk, body));
    toast.success(`Added to ${request.ref}`);
  };

  const take = (request: ServiceRequest) => {
    sync(request.id, takeBy(request, desk));
    toast.success(`${request.ref} is yours`, {
      description: `${request.requester} can see you have it.`,
      action: { label: 'Undo', onClick: () => sync(request.id, { handler: undefined, thread: request.thread }) },
    });
  };

  const markReady = (request: ServiceRequest, body: string) => {
    const before = { stage: request.stage, handler: request.handler, thread: request.thread };
    sync(request.id, readyBy(request, desk, body));
    toast.success(`${request.ref} is ready`, {
      description: `${request.requester} will collect it from ${request.deliverTo}.`,
      action: { label: 'Undo', onClick: () => sync(request.id, before) },
    });
  };

  const handOver = (request: ServiceRequest) => {
    const before = { stage: request.stage, settledAt: request.settledAt, thread: request.thread };
    sync(request.id, deliverBy(request, desk));
    toast.success(`${request.ref} handed over`, {
      description: `${money(totalOf(request))} lands on ${request.costCentre}.`,
      action: { label: 'Undo', onClick: () => sync(request.id, before) },
    });
  };

  return (
    <>
      <div className="mb-7">
        <p className="dx-eyebrow mb-2">OmniServe · service desk</p>
        <h2 className="dx-h2 text-balance">Everything the building owes somebody</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
          {waiting.length} sitting with an approver, {pipeline === 0 ? 'nothing' : money(pipeline)}{' '}
          committed but not yet delivered.
        </p>
      </div>

      <section
        aria-label="The desk at a glance"
        className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            {stat.money ? (
              <span className="block text-[1.5rem] font-medium leading-none tracking-[-0.035em] tabular-nums text-ink">
                {money(stat.value)}
              </span>
            ) : (
              <CountUp
                value={stat.value}
                className={cn(
                  'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                  stat.tone === 'brand' && 'text-brand-600',
                  stat.tone === 'warning' && 'text-warning',
                  stat.tone === 'green' && 'text-grn-500',
                )}
              />
            )}
            <p className={cn('text-[0.75rem] text-ink-muted', stat.money ? 'mt-2.5' : 'mt-2')}>
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section aria-labelledby="spend-heading" className="dx-card mb-5 px-5 py-4">
        <h3 id="spend-heading" className="dx-eyebrow mb-3">
          Where it is going
        </h3>
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          {byCategory.map((row) => {
            const Icon = CATEGORY_ICON[row.category];
            return (
              <li key={row.category}>
                <p className="flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                  <Icon size={12} aria-hidden="true" className="shrink-0" />
                  {row.category}
                  <span className="ml-auto tabular-nums">{row.count}</span>
                </p>
                <p className="mt-1 text-body font-medium tabular-nums text-ink">
                  {money(row.value)}
                </p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-nt-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-[320ms]"
                    style={{ width: `${Math.round((row.value / peak) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="desk-heading" className="dx-card overflow-hidden">
        <h3 id="desk-heading" className="sr-only">
          The request queue
        </h3>

        <Toolbar
          lenses={lenses}
          lens={lens}
          onLens={setLens}
          filters={filters}
          onFilters={setFilters}
          searchLabel="Search every request"
          withFilters
          withMine
        />

        {shown.length === 0 ? (
          <EmptyState
            icon={Gauge}
            title={
              lens === 'sign'
                ? 'Nothing is sitting with an approver.'
                : lens === 'work'
                  ? 'Everything approved has been arranged.'
                  : lens === 'ready'
                    ? 'Nothing is waiting to be collected.'
                    : 'Nothing settled matches those filters.'
            }
            actionLabel="Clear the filters"
            onAction={() => setFilters(NO_FILTERS)}
          />
        ) : (
          <>
            <ul>
              {shown.map((request) => (
                <RequestRow key={request.id} request={request} onOpen={setOpen} />
              ))}
            </ul>
            {lens === 'sign' && (
              <p className="border-t border-line bg-nt-50 px-4 py-2.5 text-[0.75rem] text-ink-muted">
                Sorted by what it costs — the biggest is {money(totalOf(shown[0]))} sitting with{' '}
                {nextApproval(shown[0])?.approver ?? 'nobody'}.
              </p>
            )}
          </>
        )}
      </section>

      {open && (
        <RequestSheet
          request={open}
          me={desk}
          onClose={() => setOpen(null)}
          onNote={note}
          onTake={take}
          onReady={markReady}
          onDeliver={handOver}
        />
      )}
    </>
  );
}
