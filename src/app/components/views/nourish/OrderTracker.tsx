import { useEffect } from 'react';
import { Check, CookingPot, PackageCheck, Receipt, Bike } from 'lucide-react';
import { cn } from '../../ui/utils';
import { orders as ordersCol } from '../../../lib/data';
import type { Order } from '../../../lib/data';
import { money } from './menu';

const STEPS: Array<{ id: Order['status']; label: string; icon: typeof Receipt }> = [
  { id: 'placed', label: 'Order placed', icon: Receipt },
  { id: 'preparing', label: 'Being prepared', icon: CookingPot },
  { id: 'on-the-way', label: 'On the way', icon: Bike },
  { id: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const ADVANCE_MS = 12_000;

interface OrderTrackerProps {
  order: Order;
}

export function OrderTracker({ order }: OrderTrackerProps) {
  const current = STEPS.findIndex((step) => step.id === order.status);

  useEffect(() => {
    if (order.status === 'delivered') return;
    const next = STEPS[current + 1];
    if (!next) return;
    const timer = window.setTimeout(() => ordersCol.update(order.id, { status: next.id }), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [order.id, order.status, current]);

  return (
    <section aria-labelledby="track-heading" className="dx-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 id="track-heading" className="dx-eyebrow">
          In progress
        </h3>
        <span className="text-[0.6875rem] tabular-nums text-ink-muted">{money(order.price)}</span>
      </div>

      <div className="px-5 py-4">
        <p className="mb-0.5 text-[0.875rem] font-medium text-ink">{order.item}</p>
        <p className="mb-4 text-[0.75rem] text-ink-muted">to {order.destination}</p>

        <ol className="relative space-y-3.5" aria-live="polite">
          <span
            className="absolute left-[0.6875rem] top-2 h-[calc(100%-1rem)] w-px bg-line"
            aria-hidden="true"
          />
          <span
            className="absolute left-[0.6875rem] top-2 w-px bg-brand-600 transition-all duration-700"
            style={{ height: `calc((100% - 1rem) * ${current / (STEPS.length - 1)})` }}
            aria-hidden="true"
          />

          {STEPS.map((step, index) => {
            const done = index < current;
            const active = index === current;

            return (
              <li key={step.id} className="relative flex items-center gap-3">
                <span
                  className={cn(
                    'z-10 grid h-[1.375rem] w-[1.375rem] shrink-0 place-items-center rounded-full border transition-colors duration-[280ms]',
                    done && 'border-brand-600 bg-brand-600 text-nt-0',
                    active && 'border-brand-600 bg-nt-0 text-brand-600',
                    !done && !active && 'border-line bg-nt-0 text-ink-subtle',
                  )}
                >
                  {done ? (
                    <Check size={11} strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <step.icon size={11} strokeWidth={2} aria-hidden="true" />
                  )}
                </span>

                <span
                  className={cn(
                    'text-[0.8125rem] transition-colors duration-[280ms]',
                    active && 'font-medium text-ink',
                    done && 'text-ink-muted',
                    !done && !active && 'text-ink-subtle',
                  )}
                >
                  {step.label}
                </span>

                {active && order.status !== 'delivered' && (
                  <span className="ml-auto flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
