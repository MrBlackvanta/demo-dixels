import { ArrowUpDown, Flag, MapPin, MoveRight } from 'lucide-react';
import { cn } from '../../ui/utils';
import { levelShort } from '../../../lib/wayfinding';
import type { Step } from '../../../lib/wayfinding';

const ICON = {
  start: MapPin,
  walk: MoveRight,
  vertical: ArrowUpDown,
  arrive: Flag,
};

interface RouteStepsProps {
  steps: Step[];
}

export function RouteSteps({ steps }: RouteStepsProps) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const Icon = ICON[step.kind];
        const last = index === steps.length - 1;

        return (
          <li key={`${step.kind}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full',
                  step.kind === 'arrive'
                    ? 'bg-brand-600 text-nt-0'
                    : step.kind === 'vertical'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-nt-100 text-ink-muted',
                )}
              >
                <Icon size={13} aria-hidden="true" />
              </span>
              {!last && <span className="w-px flex-1 bg-line" />}
            </div>

            <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-4')}>
              <p className="text-[0.8125rem] text-ink">{step.text}</p>
              <p className="mt-0.5 text-[0.6875rem] text-ink-subtle">
                {levelShort(step.level)}
                {step.metres !== undefined && ` · ${step.metres} m`}
                {step.kind === 'vertical' &&
                  ` · about ${Math.round(step.seconds / 5) * 5} sec including the wait`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
