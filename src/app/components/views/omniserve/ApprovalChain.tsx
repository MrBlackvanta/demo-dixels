import { Check, Minus, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import type { ServiceRequest } from '../../../lib/data';

type RungState = 'done' | 'now' | 'next' | 'refused' | 'dropped';

interface Rung {
  title: string;
  who: string;
  state: RungState;
  at?: string;
  note?: string;
}

const DOT: Record<RungState, string> = {
  done: 'border-grn-500 bg-grn-50 text-grn-700',
  now: 'border-brand-600 bg-brand-50 text-brand-700 ring-4 ring-brand-50',
  next: 'border-line-strong bg-nt-0 text-ink-subtle',
  refused: 'border-danger bg-danger-bg text-danger',
  dropped: 'border-line bg-nt-50 text-ink-subtle',
};

const buildRungs = (request: ServiceRequest): Rung[] => {
  const halted = request.stage === 'declined' || request.stage === 'cancelled';
  const arranging = request.stage === 'arranging';
  const past = request.stage === 'ready' || request.stage === 'delivered';

  let reached = false;

  const approvals: Rung[] = request.chain.map((step) => {
    if (step.verdict === 'approved')
      return { title: step.role, who: step.approver, state: 'done', at: step.at, note: step.note };

    if (step.verdict === 'declined')
      return { title: step.role, who: step.approver, state: 'refused', at: step.at, note: step.note };

    if (halted) return { title: step.role, who: step.approver, state: 'dropped' };

    const first = !reached;
    reached = true;
    return { title: step.role, who: step.approver, state: first ? 'now' : 'next' };
  });

  return [
    {
      title: 'Raised',
      who: request.requester,
      state: 'done',
      at: request.raisedAt,
      note: request.reason,
    },
    ...approvals,
    {
      title: 'The desk arranges it',
      who: request.handler ?? 'Not picked up yet',
      state: halted ? 'dropped' : past ? 'done' : arranging ? 'now' : 'next',
    },
    {
      title: request.stage === 'ready' ? 'Ready for you' : 'With you',
      who: request.deliverTo,
      state:
        request.stage === 'delivered'
          ? 'done'
          : halted
            ? 'dropped'
            : request.stage === 'ready'
              ? 'now'
              : 'next',
      at: request.stage === 'delivered' ? request.settledAt : undefined,
    },
  ];
};

interface ApprovalChainProps {
  request: ServiceRequest;
}

export function ApprovalChain({ request }: ApprovalChainProps) {
  const rungs = buildRungs(request);

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[0.4375rem] before:top-3 before:w-px before:bg-line">
      {rungs.map((rung, index) => (
        <li key={`${rung.title}-${index}`} className="relative flex gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'relative z-10 mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border-2',
              DOT[rung.state],
            )}
          >
            {rung.state === 'done' && <Check size={8} strokeWidth={4} />}
            {rung.state === 'refused' && <X size={8} strokeWidth={4} />}
            {rung.state === 'dropped' && <Minus size={8} strokeWidth={4} />}
          </span>

          <div className="min-w-0 flex-1 pb-0.5">
            <p
              className={cn(
                'text-[0.8125rem] font-medium',
                rung.state === 'next' || rung.state === 'dropped' ? 'text-ink-subtle' : 'text-ink',
              )}
            >
              {rung.title}
            </p>
            <p className="text-[0.75rem] text-ink-muted">
              {rung.who}
              {rung.at && ` · ${timeAgo(rung.at)}`}
              {rung.state === 'now' && ' · waiting'}
            </p>
            {rung.note && (
              <p className="mt-1 border-l-2 border-line pl-2.5 text-[0.75rem] italic leading-relaxed text-ink-muted">
                {rung.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
