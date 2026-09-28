import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { useCollection } from '../../../lib/store';
import { cart as cartCol, orders as ordersCol } from '../../../lib/data';
import type { CartLine, Order } from '../../../lib/data';
import { CartPanel } from './CartPanel';
import { ItemDialog } from './ItemDialog';
import { MenuCard } from './MenuCard';
import { OrderTracker } from './OrderTracker';
import { CATEGORIES, MENU, money } from './menu';
import type { CategoryId, MenuItem } from './menu';

type Filter = CategoryId | 'all';

const summarise = (lines: CartLine[]): string => {
  const [first, ...rest] = lines;
  if (!first) return 'Order';
  const label = first.quantity > 1 ? `${first.quantity} × ${first.name}` : first.name;
  const others = rest.reduce((sum, line) => sum + line.quantity, 0);
  return others > 0 ? `${label} + ${others} more` : label;
};

export function Nourish() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<MenuItem | null>(null);

  const orders = useCollection(ordersCol);
  const cartLines = useCollection(cartCol);

  const liveOrder = orders.find((order) => order.status !== 'delivered');
  const past = orders.filter((order) => order.status === 'delivered').slice(0, 4);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return MENU.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false;
      if (!needle) return true;
      return (
        item.name.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [filter, query]);

  const addToCart = (item: MenuItem, options: string, unitPrice: number, quantity: number) => {
    const existing = cartCol
      .all()
      .find((line) => line.menuItemId === item.id && line.options === options);

    if (existing) {
      cartCol.update(existing.id, { quantity: existing.quantity + quantity });
    } else {
      cartCol.create({ menuItemId: item.id, name: item.name, options, unitPrice, quantity });
    }

    setChosen(null);
    toast.success(`${item.name} added`, { description: options || undefined });
  };

  const quickAdd = (item: MenuItem) => {
    if (item.options.length > 0) {
      setChosen(item);
      return;
    }
    addToCart(item, '', item.price, 1);
  };

  const placeOrder = (lines: CartLine[], destination: string, total: number) => {
    ordersCol.create({
      item: summarise(lines),
      options: lines.map((line) => line.options).filter(Boolean).join(' · '),
      destination,
      price: total,
      status: 'placed',
      lines: lines.map(({ menuItemId, name, options, unitPrice, quantity }) => ({
        menuItemId,
        name,
        options,
        unitPrice,
        quantity,
      })),
    });

    cartCol.replaceAll([]);
    toast.success('Order placed', { description: `Heading to ${destination}` });
  };

  const reorder = (order: Order) => {
    const lines = order.lines ?? [];
    if (lines.length === 0) return;

    lines.forEach((line) => {
      const existing = cartCol
        .all()
        .find((row) => row.menuItemId === line.menuItemId && row.options === line.options);
      if (existing) {
        cartCol.update(existing.id, { quantity: existing.quantity + line.quantity });
      } else {
        cartCol.create({ ...line });
      }
    });

    toast.success('Added to your order', { description: summarise(lines as CartLine[]) });
  };

  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="relative">
      <div className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70" aria-hidden="true" />

      <div className="relative mx-auto max-w-[76rem] px-6 py-8">
        <header className="mb-7">
          <p className="dx-eyebrow mb-2">Nourish · Smart café</p>
          <h2 className="dx-h2 text-balance">What can we get you?</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Order to your desk, a meeting room, or collect downstairs.
          </p>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the menu"
                  aria-label="Search the menu"
                  className="dx-field pl-9"
                />
              </div>

              <div
                role="tablist"
                aria-label="Menu categories"
                className="-mx-6 flex gap-1.5 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {([{ id: 'all', label: 'All' }, ...CATEGORIES] as Array<{ id: Filter; label: string }>).map(
                  (category) => (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={filter === category.id}
                      onClick={() => setFilter(category.id)}
                      className={cn(
                        'shrink-0 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                        filter === category.id
                          ? 'bg-ink font-medium text-nt-0'
                          : 'text-ink-muted hover:bg-nt-100 hover:text-ink',
                      )}
                    >
                      {category.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="dx-card grid min-h-[16rem] place-items-center px-6 text-center">
                <div>
                  <p className="text-body text-ink">Nothing matches “{query}”.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                    className="dx-btn-ghost mt-3"
                  >
                    Clear the search
                  </button>
                </div>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((item) => (
                  <li key={item.id} className="contents">
                    <MenuCard item={item} onSelect={quickAdd} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <CartPanel onPlace={placeOrder} />

            {liveOrder && <OrderTracker order={liveOrder} />}

            {past.length > 0 && (
              <section aria-labelledby="past-heading" className="dx-card overflow-hidden">
                <div className="border-b border-line px-5 py-3.5">
                  <h3 id="past-heading" className="dx-eyebrow">
                    Order again
                  </h3>
                </div>
                <ul className="divide-y divide-line">
                  {past.map((order) => (
                    <li key={order.id}>
                      <button
                        type="button"
                        onClick={() => reorder(order)}
                        disabled={(order.lines ?? []).length === 0}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-[180ms] hover:bg-nt-50 disabled:opacity-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-medium text-ink">
                            {order.item}
                          </span>
                          <span className="block truncate text-[0.6875rem] text-ink-muted">
                            {money(order.price)} · {order.destination}
                          </span>
                        </span>
                        <RotateCcw size={14} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      {chosen && <ItemDialog item={chosen} onClose={() => setChosen(null)} onAdd={addToCart} />}

      {cartCount > 0 && (
        <div className="pointer-events-none sticky bottom-0 z-30 px-6 pb-5 xl:hidden">
          <a
            href="#cart-heading"
            className="dx-btn-primary pointer-events-auto flex w-full shadow-pop"
          >
            Review order
            <span className="tabular-nums">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
