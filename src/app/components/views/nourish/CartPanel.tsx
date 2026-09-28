import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { cart as cartCol, orderDestination } from '../../../lib/data';
import type { CartLine } from '../../../lib/data';
import { useCollection, useScalar } from '../../../lib/store';
import { DESTINATIONS, money } from './menu';

interface CartPanelProps {
  onPlace: (lines: CartLine[], destination: string, total: number) => void;
}

export function CartPanel({ onPlace }: CartPanelProps) {
  const lines = useCollection(cartCol);
  const [destination, setDestination] = useScalar(orderDestination);

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <section aria-labelledby="cart-heading" className="dx-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 id="cart-heading" className="dx-eyebrow">
          Your order
        </h3>
        {count > 0 && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-medium tabular-nums text-brand-700">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-nt-100 text-ink-subtle">
            <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="text-body-sm text-ink-muted">Nothing here yet.</p>
          <p className="mt-1 text-[0.75rem] text-ink-subtle">Pick something from the menu.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <li key={line.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-ink">{line.name}</span>
                  {line.options && (
                    <span className="block truncate text-[0.6875rem] text-ink-muted">{line.options}</span>
                  )}
                  <span className="mt-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Fewer ${line.name}`}
                      onClick={() =>
                        line.quantity === 1
                          ? cartCol.remove(line.id)
                          : cartCol.update(line.id, { quantity: line.quantity - 1 })
                      }
                      className="grid h-6 w-6 place-items-center rounded-sm border border-line text-ink-muted transition-colors duration-[180ms] hover:border-line-strong hover:text-ink"
                    >
                      <Minus size={11} aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-[0.75rem] font-medium tabular-nums text-ink">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`More ${line.name}`}
                      onClick={() => cartCol.update(line.id, { quantity: line.quantity + 1 })}
                      className="grid h-6 w-6 place-items-center rounded-sm border border-line text-ink-muted transition-colors duration-[180ms] hover:border-line-strong hover:text-ink"
                    >
                      <Plus size={11} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => cartCol.remove(line.id)}
                      className="ml-1 grid h-6 w-6 place-items-center rounded-sm text-ink-subtle transition-colors duration-[180ms] hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 size={11} aria-hidden="true" />
                    </button>
                  </span>
                </span>

                <span className="shrink-0 text-[0.8125rem] font-medium tabular-nums text-ink">
                  {money(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-line px-5 py-4">
            <label htmlFor="destination" className="dx-eyebrow mb-2 block">
              Deliver to
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="dx-field mb-4"
            >
              {DESTINATIONS.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>

            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-body-sm text-ink-muted">Total</span>
              <span className="text-[1.25rem] font-medium tabular-nums tracking-[-0.02em] text-ink">
                {money(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onPlace(lines, destination, total)}
              className="dx-btn-primary w-full"
            >
              Place order
            </button>
          </div>
        </>
      )}
    </section>
  );
}
