import { useMemo, useState } from 'react';
import { Inbox, LayoutGrid, PackageSearch, Stamp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, requests as requestsCol } from '../../../lib/data';
import { money } from '../../../lib/format';
import {
  CATEGORY_BLURB,
  CATEGORY_ICON,
  SERVICES,
  SERVICE_CATEGORIES,
  awaits,
  chainFor,
  cheapest,
  costCentreOf,
} from '../../../lib/catalogue';
import type { Service } from '../../../lib/catalogue';
import type { ServiceCategory, ServiceRequest } from '../../../lib/data';
import { CatalogCard } from './CatalogCard';
import { OrderDialog } from './OrderDialog';
import type { Draft } from './OrderDialog';
import { RequestCard } from './RequestCard';
import { RequestSheet } from './RequestSheet';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import {
  NO_FILTERS,
  approveBy,
  byNewest,
  cancelBy,
  declineBy,
  deliverBy,
  isOpen,
  matchesFilters,
  rateWith,
  withNote,
} from './desk';
import type { Filters } from './desk';

const me = CURRENT_USER.name;
const myTeam = CURRENT_USER.team;

export function RequestConsole() {
  const all = useCollection(requestsCol);

  const [lens, setLens] = useState('shop');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all');
  const [open, setOpen] = useState<ServiceRequest | null>(null);
  const [ordering, setOrdering] = useState<Service | null>(null);

  const mine = useMemo(() => all.filter((row) => row.requester === me), [all]);
  const live = useMemo(() => mine.filter(isOpen), [mine]);
  const ready = useMemo(() => mine.filter((row) => row.stage === 'ready'), [mine]);
  const toSign = useMemo(() => all.filter((row) => awaits(row, me)), [all]);

  const needle = filters.search.trim().toLowerCase();

  const catalogue = useMemo(
    () =>
      SERVICES.filter((service) => category === 'all' || service.category === category).filter(
        (service) =>
          !needle ||
          `${service.name} ${service.blurb} ${service.category}`.toLowerCase().includes(needle),
      ),
    [category, needle],
  );

  const shown = useMemo(() => {
    const rows = lens === 'sign' ? toSign : mine;
    return rows.filter((row) => matchesFilters(row, filters, me)).sort(byNewest);
  }, [lens, toSign, mine, filters]);

  const lenses: Lens[] = [
    { id: 'shop', label: 'Catalogue', icon: LayoutGrid },
    { id: 'mine', label: 'My requests', icon: PackageSearch, count: live.length },
    { id: 'sign', label: 'To approve', icon: Stamp, count: toSign.length },
  ];

  const stats = [
    { label: 'On the way to you', value: live.length, tone: 'brand' as const },
    { label: 'Waiting on your approval', value: toSign.length, tone: 'warning' as const },
    { label: 'Ready to collect', value: ready.length, tone: 'green' as const },
  ];

  const sync = (id: string, patch: Partial<ServiceRequest>) => {
    const updated = requestsCol.update(id, patch);
    setOpen((sheet) => (sheet && sheet.id === id ? updated ?? sheet : sheet));
  };

  const note = (request: ServiceRequest, body: string) => {
    sync(request.id, withNote(request, me, body));
    toast.success(`Added to ${request.ref}`);
  };

  const approve = (request: ServiceRequest, body: string) => {
    const before = { chain: request.chain, stage: request.stage, thread: request.thread };
    const patch = approveBy(request, me, body);
    sync(request.id, patch);

    const outstanding = patch.chain?.find((step) => step.verdict === 'pending');
    toast.success(`You signed off ${request.ref}`, {
      description: outstanding
        ? `Now with ${outstanding.approver}.`
        : 'The desk can order it now.',
      action: { label: 'Undo', onClick: () => sync(request.id, before) },
    });
  };

  const decline = (request: ServiceRequest, reason: string) => {
    const before = {
      chain: request.chain,
      stage: request.stage,
      thread: request.thread,
      settledAt: request.settledAt,
    };
    sync(request.id, declineBy(request, me, reason));
    toast.success(`You declined ${request.ref}`, {
      description: `${request.requester} will see your reason on the thread.`,
      action: { label: 'Undo', onClick: () => sync(request.id, before) },
    });
  };

  const deliver = (request: ServiceRequest) => {
    sync(request.id, deliverBy(request, me));
    toast.success(`${request.ref} is yours`, { description: 'Rate it whenever you have used it.' });
  };

  const withdraw = (request: ServiceRequest, reason: string) => {
    const before = { stage: request.stage, thread: request.thread, settledAt: request.settledAt };
    sync(request.id, cancelBy(request, me, reason));
    toast.success(`${request.ref} withdrawn`, {
      description: 'Nobody else has to look at it now.',
      action: { label: 'Undo', onClick: () => sync(request.id, before) },
    });
  };

  const rate = (request: ServiceRequest, score: number) => {
    sync(request.id, rateWith(request, score));
    toast.success(`Thanks — ${score} out of 5`);
  };

  const order = (service: Service, draft: Draft & { deliverTo: string; unitCost: number }) => {
    const raisedAt = new Date().toISOString();
    const total = draft.unitCost * draft.quantity;
    const chain = chainFor(service, me, myTeam, total);
    const highest = all.reduce((top, row) => Math.max(top, Number(row.ref.slice(4)) || 0), 2039);

    const created = requestsCol.create({
      ref: `OMS-${highest + 1}`,
      serviceId: service.id,
      service: service.name,
      category: service.category,
      choice: draft.choice,
      quantity: draft.quantity,
      unitCost: draft.unitCost,
      requester: me,
      team: myTeam,
      reason: draft.reason.trim(),
      costCentre: costCentreOf(myTeam),
      stage: chain.length > 0 ? 'approval' : 'arranging',
      raisedAt,
      neededBy: draft.neededBy,
      deliverTo: draft.deliverTo,
      spaceId: draft.spaceId || undefined,
      chain,
      thread: [{ author: 'OmniServe', body: `${me} asked for this`, at: raisedAt, kind: 'event' }],
    });

    setOrdering(null);
    setLens('mine');
    toast.success(`${created.ref} is on its way`, {
      description:
        chain.length > 0
          ? `${chain[0].approver} has to sign it off first — ${total === 0 ? 'no charge' : money(total)}.`
          : 'Nobody had to sign it, so the desk has it already.',
      action: { label: 'Undo', onClick: () => requestsCol.remove(created.id) },
    });
  };

  return (
    <>
      <div className="mb-7">
        <p className="dx-eyebrow mb-2">OmniServe · {CURRENT_USER.building}</p>
        <h2 className="dx-h2 text-balance">Ask for what you need</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
          Everything the building can give you, with the price and the people who sign it off shown
          before you send it.
        </p>
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

      <section aria-labelledby="omniserve-heading" className="dx-card overflow-hidden">
        <h3 id="omniserve-heading" className="sr-only">
          The service catalogue and your requests
        </h3>

        <Toolbar
          lenses={lenses}
          lens={lens}
          onLens={setLens}
          filters={filters}
          onFilters={setFilters}
          searchLabel={lens === 'shop' ? 'Search the catalogue' : 'Search your requests'}
          withFilters={lens !== 'shop'}
        />

        {lens === 'shop' ? (
          <div className="bg-nt-50 p-4">
            <div className="mb-4 min-w-0 max-w-full overflow-x-auto">
              <div className="flex w-max gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  aria-pressed={category === 'all'}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    category === 'all'
                      ? 'bg-ink font-medium text-nt-0'
                      : 'bg-nt-0 text-ink-muted hover:text-ink',
                  )}
                >
                  Everything
                </button>
                {SERVICE_CATEGORIES.map((entry) => {
                  const Icon = CATEGORY_ICON[entry];
                  return (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => setCategory(entry)}
                      aria-pressed={category === entry}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                        category === entry
                          ? 'bg-ink font-medium text-nt-0'
                          : 'bg-nt-0 text-ink-muted hover:text-ink',
                      )}
                    >
                      <Icon size={13} aria-hidden="true" />
                      {entry}
                    </button>
                  );
                })}
              </div>
            </div>

            {category !== 'all' && (
              <p className="mb-4 text-[0.8125rem] text-ink-muted">{CATEGORY_BLURB[category]}</p>
            )}

            {catalogue.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Nothing in the catalogue matches that."
                actionLabel="Show everything"
                onAction={() => {
                  setCategory('all');
                  setFilters(NO_FILTERS);
                }}
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {catalogue.map((service) => (
                  <CatalogCard
                    key={service.id}
                    service={service}
                    signOff={chainFor(service, me, myTeam, cheapest(service)).length > 0}
                    onPick={setOrdering}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              lens === 'sign'
                ? 'Nothing is waiting on your signature.'
                : mine.length === 0
                  ? 'You have not asked for anything yet.'
                  : 'Nothing of yours matches that.'
            }
            actionLabel={lens === 'sign' ? 'Back to the catalogue' : 'Browse the catalogue'}
            onAction={() => {
              setFilters(NO_FILTERS);
              setLens('shop');
            }}
          />
        ) : (
          <ul className="space-y-3 bg-nt-50 p-4">
            {shown.map((request) => (
              <RequestCard key={request.id} request={request} onOpen={setOpen} />
            ))}
          </ul>
        )}
      </section>

      {open && (
        <RequestSheet
          request={open}
          me={me}
          onClose={() => setOpen(null)}
          onNote={note}
          onApprove={approve}
          onDecline={decline}
          onDeliver={open.requester === me ? deliver : undefined}
          onCancel={withdraw}
          onRate={rate}
        />
      )}

      {ordering && (
        <OrderDialog
          service={ordering}
          me={me}
          team={myTeam}
          open={live}
          onClose={() => setOrdering(null)}
          onSend={(draft) => order(ordering, draft)}
        />
      )}
    </>
  );
}
