import { cn } from '../../ui/utils';
import type { ServiceRequest } from '../../../lib/data';

const TONE = {
  approved: 'bg-grn-500',
  declined: 'bg-danger',
  pending: 'bg-warning',
  waiting: 'bg-line-strong',
} as const;

interface ChainDotsProps {
  request: ServiceRequest;
}

export function ChainDots({ request }: ChainDotsProps) {
  if (request.chain.length === 0) {
    return (
      <span className="text-[0.6875rem] text-ink-subtle">Nobody had to sign this</span>
    );
  }

  const signedOff = request.chain.filter((step) => step.verdict === 'approved').length;
  let reached = false;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-1" aria-hidden="true">
        {request.chain.map((step, index) => {
          const first = step.verdict === 'pending' && !reached;
          if (first) reached = true;

          return (
            <span
              key={`${step.role}-${index}`}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                step.verdict === 'pending' ? TONE[first ? 'pending' : 'waiting'] : TONE[step.verdict],
              )}
            />
          );
        })}
      </span>
      <span className="text-[0.6875rem] text-ink-muted">
        {signedOff} of {request.chain.length} signed
      </span>
    </span>
  );
}
