import { useState } from 'react';
import { Plus, Sliders } from 'lucide-react';
import { cn } from '../../ui/utils';
import { money } from '../../../lib/format';
import type { MenuItem } from './menu';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuCard({ item, onSelect }: MenuCardProps) {
  const [loaded, setLoaded] = useState(false);
  const configurable = item.options.length > 0;

  return (
    <button
      type="button"
      disabled={item.soldOut}
      onClick={() => onSelect(item)}
      aria-label={`${item.name}, ${money(item.price)}${configurable ? ', choose options' : ', add to order'}`}
      className={cn(
        'dx-card group relative flex flex-col overflow-hidden text-left transition-all duration-[180ms]',
        item.soldOut
          ? 'opacity-55'
          : 'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise',
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-nt-100">
        <span
          className="absolute inset-0 bg-gradient-to-br from-brand-100 via-nt-100 to-grn-100"
          aria-hidden="true"
        />
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'relative h-full w-full object-cover transition-all duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            !item.soldOut && 'group-hover:scale-[1.04]',
          )}
        />

        {item.tags[0] && !item.soldOut && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-nt-0/92 px-2 py-0.5 text-[0.625rem] font-medium text-ink backdrop-blur-sm">
            {item.tags[0]}
          </span>
        )}

        {item.soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-nt-950/45">
            <span className="rounded-full bg-nt-0 px-3 py-1 text-[0.6875rem] font-medium text-ink">
              Sold out
            </span>
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col p-4">
        <span className="mb-1 flex items-start justify-between gap-3">
          <span className="text-[0.875rem] font-medium leading-snug text-ink">{item.name}</span>
          <span className="shrink-0 text-[0.875rem] font-medium tabular-nums text-ink">
            {money(item.price)}
          </span>
        </span>

        <span className="mb-3 line-clamp-2 text-[0.75rem] leading-relaxed text-ink-muted">
          {item.description}
        </span>

        <span className="mt-auto flex items-center justify-between">
          <span className="text-[0.6875rem] text-ink-subtle">
            {item.calories > 0 ? `${item.calories} kcal` : 'No calories'}
          </span>

          {!item.soldOut && (
            <span
              className="grid h-7 w-7 place-items-center rounded-full bg-nt-100 text-ink-muted transition-colors duration-[180ms] group-hover:bg-brand-600 group-hover:text-nt-0"
              aria-hidden="true"
            >
              {configurable ? <Sliders size={13} strokeWidth={2} /> : <Plus size={14} strokeWidth={2.2} />}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
