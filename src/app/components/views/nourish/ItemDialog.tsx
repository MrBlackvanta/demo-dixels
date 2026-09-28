import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { defaultSelection, describeSelection, money, priceFor } from './menu';
import type { MenuItem } from './menu';

interface ItemDialogProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, options: string, unitPrice: number, quantity: number) => void;
}

export function ItemDialog({ item, onClose, onAdd }: ItemDialogProps) {
  const [selection, setSelection] = useState(() => defaultSelection(item));
  const [quantity, setQuantity] = useState(1);

  const unitPrice = priceFor(item, selection);

  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-dialog-title"
        className="dx-card relative flex w-full max-w-md flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className="relative h-36 shrink-0 overflow-hidden bg-nt-100">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-nt-100 to-grn-100" aria-hidden="true" />
          <img src={item.image} alt="" className="relative h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-nt-0/92 text-ink backdrop-blur-sm transition-colors duration-[180ms] hover:bg-nt-0"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <h2 id="item-dialog-title" className="dx-h4 mb-1">
            {item.name}
          </h2>
          <p className="mb-1.5 text-body-sm leading-relaxed text-ink-muted">{item.description}</p>
          <p className="mb-5 text-[0.6875rem] text-ink-subtle">
            {item.calories > 0 && `${item.calories} kcal`}
            {item.allergens.length > 0 && ` · Contains ${item.allergens.join(', ').toLowerCase()}`}
          </p>

          {item.options.map((group) => (
            <fieldset key={group.id} className="mb-5">
              <legend className="dx-eyebrow mb-2.5">
                {group.name}
                {!group.required && <span className="ml-1.5 normal-case tracking-normal text-ink-subtle">optional</span>}
              </legend>

              <div className="flex flex-wrap gap-2">
                {group.choices.map((choice) => {
                  const active = selection[group.id] === choice.label;
                  return (
                    <button
                      key={choice.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setSelection((prev) => ({
                          ...prev,
                          [group.id]: active && !group.required ? '' : choice.label,
                        }))
                      }
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                        active
                          ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'border-line bg-nt-0 text-ink hover:border-line-strong hover:bg-nt-50',
                      )}
                    >
                      {choice.label}
                      {choice.delta > 0 && (
                        <span className={cn('ml-1.5 tabular-nums', active ? 'text-brand-600' : 'text-ink-subtle')}>
                          +{money(choice.delta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-line px-6 py-4">
          <div className="flex items-center gap-1 rounded-md border border-line">
            <button
              type="button"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              disabled={quantity === 1}
              aria-label="Fewer"
              className="grid h-9 w-9 place-items-center rounded-l-md text-ink-muted transition-colors duration-[180ms] hover:bg-nt-100 hover:text-ink disabled:opacity-40"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="w-7 text-center text-[0.875rem] font-medium tabular-nums text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((n) => Math.min(20, n + 1))}
              aria-label="More"
              className="grid h-9 w-9 place-items-center rounded-r-md text-ink-muted transition-colors duration-[180ms] hover:bg-nt-100 hover:text-ink"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAdd(item, describeSelection(item, selection), unitPrice, quantity)}
            className="dx-btn-primary flex-1"
          >
            Add to order
            <span className="tabular-nums">{money(unitPrice * quantity)}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
