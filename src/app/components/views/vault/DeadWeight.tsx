import { Sparkles } from 'lucide-react';
import { timeAgo } from '../../../lib/format';
import { EmptyState } from '../../shell/EmptyState';
import { AssetThumb } from './AssetThumb';
import { byWeight, idle, shelfName, usageOf, weight } from './assets';
import type { Wall } from './assets';
import type { Asset, Shelf } from '../../../lib/data';

interface DeadWeightProps {
  assets: Asset[];
  wall: Wall;
  shelves: Shelf[];
  onOpen: (asset: Asset) => void;
  onRetire: (asset: Asset) => void;
  onBrowse: () => void;
}

export function DeadWeight({ assets, wall, shelves, onOpen, onRetire, onBrowse }: DeadWeightProps) {
  const unused = assets
    .filter((asset) => idle(asset, usageOf(asset, wall)))
    .sort(byWeight);

  const total = unused.reduce((sum, asset) => sum + asset.bytes, 0);

  if (unused.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Every file in here is doing something."
        actionLabel="Back to the shelves"
        onAction={onBrowse}
      />
    );
  }

  return (
    <div className="p-4">
      <p className="mb-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
        {unused.length} files are pointed at nothing and have not been opened in three months.
        Retiring the lot gives back {weight(total)}.
      </p>

      <ul className="space-y-2">
        {unused.map((asset) => (
          <li
            key={asset.id}
            className="flex items-center gap-3 rounded-sm border border-line bg-nt-0 p-2.5"
          >
            <button
              type="button"
              onClick={() => onOpen(asset)}
              className="h-12 w-16 shrink-0 overflow-hidden rounded-sm"
            >
              <AssetThumb asset={asset} ratio="aspect-[4/3]" rounded="rounded-sm" />
            </button>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onOpen(asset)}
                className="block w-full truncate text-left text-[0.8125rem] font-medium text-ink transition-colors duration-[180ms] hover:text-brand-700"
              >
                {asset.name}
              </button>
              <p className="mt-0.5 truncate text-[0.6875rem] text-ink-subtle">
                {shelfName(shelves, asset.shelfId)} · {weight(asset.bytes)} ·{' '}
                {asset.openedAt === undefined
                  ? 'never opened'
                  : `last opened ${timeAgo(asset.openedAt)}`}
              </p>
            </div>

            {asset.status === 'retired' ? (
              <span className="shrink-0 rounded-full bg-nt-100 px-2 py-0.5 text-[0.6875rem] text-ink-subtle">
                Retired
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRetire(asset)}
                className="shrink-0 rounded-sm px-2.5 py-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:bg-brand-50"
              >
                Retire
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
