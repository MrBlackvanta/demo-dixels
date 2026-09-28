import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { useCollection } from '../../../lib/store';
import { deliveries as deliveriesCol } from '../../../lib/data';
import { CARRIERS } from './visits';

export function Deliveries() {
  const rows = useCollection(deliveriesCol);
  const [adding, setAdding] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [carrier, setCarrier] = useState(CARRIERS[0]);

  const waiting = rows.filter((row) => !row.collected);

  const log = (event: React.FormEvent) => {
    event.preventDefault();
    const name = recipient.trim();
    if (!name) return;

    deliveriesCol.create({
      recipient: name,
      carrier,
      tracking: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      collected: false,
    });

    setRecipient('');
    setAdding(false);
    toast.success('Delivery logged', { description: `${name} has been notified.` });
  };

  return (
    <section aria-labelledby="deliveries-heading" className="dx-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h3 id="deliveries-heading" className="dx-eyebrow">
          At the desk
          {waiting.length > 0 && <span className="ml-1.5 tabular-nums">{waiting.length}</span>}
        </h3>
        <button
          type="button"
          onClick={() => setAdding((open) => !open)}
          aria-expanded={adding}
          className="dx-btn-ghost px-2 py-1"
        >
          <Plus size={14} aria-hidden="true" />
          Log
        </button>
      </div>

      {adding && (
        <form onSubmit={log} className="space-y-2.5 border-b border-line bg-nt-50 px-5 py-4">
          <input
            type="text"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="Who is it for?"
            aria-label="Recipient"
            className="dx-field py-2 text-[0.8125rem]"
          />
          <div className="flex gap-2">
            <select
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              aria-label="Carrier"
              className="dx-field py-2 text-[0.8125rem]"
            >
              {CARRIERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!recipient.trim()} className="dx-btn-primary shrink-0">
              Log it
            </button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <p className="px-5 py-6 text-center text-[0.8125rem] text-ink-muted">Nothing waiting.</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-5 py-3">
              <Package
                size={15}
                className={cn('shrink-0', row.collected ? 'text-ink-subtle' : 'text-brand-500')}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-[0.8125rem]',
                    row.collected ? 'text-ink-muted line-through decoration-line-strong' : 'font-medium text-ink',
                  )}
                >
                  {row.recipient}
                </span>
                <span className="block truncate text-[0.6875rem] text-ink-muted">
                  {row.carrier} · {row.tracking}
                </span>
              </span>
              {row.collected ? (
                <button
                  type="button"
                  onClick={() => deliveriesCol.remove(row.id)}
                  className="dx-btn-ghost shrink-0 px-2 py-1 text-[0.6875rem]"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    deliveriesCol.update(row.id, { collected: true });
                    toast.success(`Handed to ${row.recipient}`);
                  }}
                  className="dx-btn-secondary shrink-0 px-2.5 py-1 text-[0.6875rem]"
                >
                  Collected
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
