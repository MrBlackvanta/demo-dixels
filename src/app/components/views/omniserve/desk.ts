import { nextApproval, totalOf } from '../../../lib/catalogue';
import type { ServiceCategory, ServiceRequest, RequestStage, ThreadEntry } from '../../../lib/data';

export const STAGE_LABEL: Record<RequestStage, string> = {
  approval: 'Waiting on approval',
  arranging: 'Being arranged',
  ready: 'Ready for you',
  delivered: 'Done',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export const STAGE_TONE: Record<RequestStage, string> = {
  approval: 'bg-warning-bg text-warning',
  arranging: 'bg-brand-50 text-brand-700',
  ready: 'bg-grn-100 text-grn-700',
  delivered: 'bg-nt-100 text-ink-muted',
  declined: 'bg-danger-bg text-danger',
  cancelled: 'bg-nt-100 text-ink-subtle',
};

export const OPEN_STAGES: RequestStage[] = ['approval', 'arranging', 'ready'];

export const isOpen = (request: ServiceRequest): boolean => OPEN_STAGES.includes(request.stage);

export const isSpend = (request: ServiceRequest): boolean =>
  request.stage !== 'declined' && request.stage !== 'cancelled';

export const committed = (rows: ServiceRequest[]): number =>
  rows.filter(isSpend).reduce((sum, request) => sum + totalOf(request), 0);

export const waitingOn = (request: ServiceRequest): string =>
  nextApproval(request)?.approver ?? request.handler ?? 'Nobody yet';

const entry = (author: string, body: string, kind: 'note' | 'event'): ThreadEntry => ({
  author,
  body,
  at: new Date().toISOString(),
  kind,
});

export const withNote = (
  request: ServiceRequest,
  author: string,
  body: string,
): Partial<ServiceRequest> => ({
  thread: [...request.thread, entry(author, body, 'note')],
});

const signed = (request: ServiceRequest, approver: string, note: string, refused: boolean) =>
  request.chain.map((step) =>
    step.approver === approver && step.verdict === 'pending'
      ? {
          ...step,
          verdict: refused ? ('declined' as const) : ('approved' as const),
          at: new Date().toISOString(),
          note: note || undefined,
        }
      : step,
  );

export const approveBy = (
  request: ServiceRequest,
  approver: string,
  note: string,
): Partial<ServiceRequest> => {
  const chain = signed(request, approver, note, false);
  const outstanding = chain.some((step) => step.verdict === 'pending');

  return {
    chain,
    stage: outstanding ? 'approval' : 'arranging',
    thread: [
      ...request.thread,
      ...(note ? [entry(approver, note, 'note')] : []),
      entry(
        'OmniServe',
        outstanding
          ? `${approver} approved it — now with ${chain.find((step) => step.verdict === 'pending')?.approver}`
          : `${approver} approved it — the desk can order it now`,
        'event',
      ),
    ],
  };
};

export const declineBy = (
  request: ServiceRequest,
  approver: string,
  reason: string,
): Partial<ServiceRequest> => ({
  chain: signed(request, approver, reason, true),
  stage: 'declined',
  settledAt: new Date().toISOString(),
  thread: [
    ...request.thread,
    entry(approver, reason, 'note'),
    entry('OmniServe', `${approver} declined it`, 'event'),
  ],
});

export const takeBy = (request: ServiceRequest, handler: string): Partial<ServiceRequest> => ({
  handler,
  thread: [...request.thread, entry('OmniServe', `${handler} picked it up`, 'event')],
});

export const readyBy = (
  request: ServiceRequest,
  handler: string,
  note: string,
): Partial<ServiceRequest> => ({
  stage: 'ready',
  handler: request.handler ?? handler,
  thread: [
    ...request.thread,
    ...(note ? [entry(handler, note, 'note')] : []),
    entry('OmniServe', 'Ready for collection', 'event'),
  ],
});

export const deliverBy = (request: ServiceRequest, actor: string): Partial<ServiceRequest> => ({
  stage: 'delivered',
  settledAt: new Date().toISOString(),
  thread: [...request.thread, entry('OmniServe', `${actor} confirmed it arrived`, 'event')],
});

export const cancelBy = (
  request: ServiceRequest,
  actor: string,
  reason: string,
): Partial<ServiceRequest> => ({
  stage: 'cancelled',
  settledAt: new Date().toISOString(),
  thread: [
    ...request.thread,
    ...(reason ? [entry(actor, reason, 'note')] : []),
    entry('OmniServe', `${actor} withdrew the request`, 'event'),
  ],
});

export const rateWith = (request: ServiceRequest, score: number): Partial<ServiceRequest> => ({
  rating: score,
  thread: [
    ...request.thread,
    entry('OmniServe', `${request.requester} rated this ${score} out of 5`, 'event'),
  ],
});

export const byOldest = (a: ServiceRequest, b: ServiceRequest): number =>
  a.raisedAt.localeCompare(b.raisedAt);

export const byNewest = (a: ServiceRequest, b: ServiceRequest): number =>
  b.raisedAt.localeCompare(a.raisedAt);

export const byValue = (a: ServiceRequest, b: ServiceRequest): number => totalOf(b) - totalOf(a);

export interface Filters {
  search: string;
  category: ServiceCategory | 'all';
  stage: RequestStage | 'all';
  mineOnly: boolean;
}

export const NO_FILTERS: Filters = {
  search: '',
  category: 'all',
  stage: 'all',
  mineOnly: false,
};

export const activeFilterCount = (filters: Filters): number =>
  (filters.category === 'all' ? 0 : 1) + (filters.stage === 'all' ? 0 : 1) + (filters.mineOnly ? 1 : 0);

export const matchesFilters = (
  request: ServiceRequest,
  filters: Filters,
  handler: string,
): boolean => {
  if (filters.category !== 'all' && request.category !== filters.category) return false;
  if (filters.stage !== 'all' && request.stage !== filters.stage) return false;
  if (filters.mineOnly && request.handler !== handler) return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [
    request.ref,
    request.service,
    request.choice,
    request.requester,
    request.team,
    request.reason,
    request.deliverTo,
    request.costCentre,
  ]
    .join(' ')
    .toLowerCase()
    .includes(needle);
};
