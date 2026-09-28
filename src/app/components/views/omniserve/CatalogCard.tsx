import { ArrowRight, Clock, Zap } from 'lucide-react';
import { cn } from '../../ui/utils';
import { money } from '../../../lib/format';
import { cheapest } from '../../../lib/catalogue';
import type { Service } from '../../../lib/catalogue';

const leadLabel = (days: number): string =>
  days <= 1 ? 'Next working day' : `About ${days} working days`;

interface CatalogCardProps {
  service: Service;
  signOff: boolean;
  onPick: (service: Service) => void;
}

export function CatalogCard({ service, signOff, onPick }: CatalogCardProps) {
  const Icon = service.icon;
  const from = cheapest(service);

  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(service)}
        className="group dx-card flex h-full w-full flex-col px-5 py-4 text-left transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-raise"
      >
        <span className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors duration-[180ms] group-hover:bg-brand-600 group-hover:text-nt-0">
            <Icon size={17} aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-body font-medium text-ink">{service.name}</span>
              {service.popular && (
                <span className="rounded-full bg-nt-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-ink-muted">
                  Popular
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-muted">
              {service.blurb}
            </span>
          </span>
        </span>

        <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[0.75rem] text-ink-muted">
          <span className="font-medium tabular-nums text-ink">
            {from === 0 ? 'No charge' : `${service.choices.length > 1 ? 'From ' : ''}${money(from)}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {leadLabel(service.leadDays)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1',
              !signOff && 'font-medium text-grn-700',
            )}
          >
            {!signOff && <Zap size={11} aria-hidden="true" />}
            {signOff ? 'Needs a sign-off' : 'No sign-off'}
          </span>
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="ml-auto shrink-0 text-ink-subtle transition-transform duration-[180ms] group-hover:translate-x-0.5 group-hover:text-brand-600"
          />
        </span>
      </button>
    </li>
  );
}
