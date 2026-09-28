import { CircleCheckBig, Timer, TriangleAlert } from 'lucide-react';
import { cn } from '../../ui/utils';
import { slaLabel, slaState } from '../../../lib/sla';
import type { Ticket } from '../../../lib/data';
import { SLA_TONE, slaProgress } from './support';

interface SlaPillProps {
  ticket: Ticket;
  withBar?: boolean;
}

export function SlaPill({ ticket, withBar = false }: SlaPillProps) {
  const state = slaState(ticket);
  const tone = SLA_TONE[state];
  const Icon = state === 'breached' ? TriangleAlert : state === 'met' ? CircleCheckBig : Timer;

  return (
    <div className={cn(withBar && 'w-full')}>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
          tone.chip,
        )}
      >
        <Icon size={11} aria-hidden="true" />
        {slaLabel(ticket)}
      </span>

      {withBar && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-nt-100">
          <div
            className={cn('h-full rounded-full transition-[width] duration-[240ms]', tone.bar)}
            style={{ width: `${slaProgress(ticket)}%` }}
          />
        </div>
      )}
    </div>
  );
}
