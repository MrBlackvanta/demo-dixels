import { AlertTriangle, MonitorPlay } from 'lucide-react';
import { cn } from '../../ui/utils';
import { AssetThumb } from './AssetThumb';
import { expired, expiryLabel, inUse, runningOut, statusOf, usageLabel, weight } from './assets';
import type { Usage } from './assets';
import type { Asset } from '../../../lib/data';

interface AssetCardProps {
  asset: Asset;
  usage: Usage;
  selected: boolean;
  onOpen: () => void;
}

export function AssetCard({ asset, usage, selected, onOpen }: AssetCardProps) {
  const status = statusOf(asset.status);
  const gone = expired(asset);
  const soon = runningOut(asset);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group block w-full overflow-hidden rounded-sm border bg-nt-0 text-left transition-all duration-[180ms]',
        selected
          ? 'border-brand-400 shadow-raise'
          : 'border-line hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise',
      )}
    >
      <span className="relative block">
        <AssetThumb asset={asset} />

        {usage.screens > 0 && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-nt-950/70 px-2 py-0.5 text-[0.625rem] font-medium text-nt-0 backdrop-blur-sm">
            <MonitorPlay size={10} aria-hidden="true" />
            {usage.screens}
          </span>
        )}

        {(gone || soon) && (
          <span
            className={cn(
              'absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-medium backdrop-blur-sm',
              gone ? 'bg-danger/90 text-nt-0' : 'bg-warning/90 text-nt-950',
            )}
          >
            <AlertTriangle size={10} aria-hidden="true" />
            {expiryLabel(asset)}
          </span>
        )}
      </span>

      <span className="block px-3 py-2.5">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-ink">
            {asset.name}
          </span>
          {asset.status !== 'approved' && (
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium',
                status.tone,
              )}
            >
              {status.label}
            </span>
          )}
        </span>

        <span className="mt-1 block truncate text-[0.6875rem] text-ink-subtle">
          {weight(asset.bytes)} · {asset.owner}
        </span>

        <span
          className={cn(
            'mt-1.5 block truncate text-[0.6875rem]',
            inUse(usage) ? 'text-brand-700' : 'text-ink-subtle',
          )}
        >
          {usageLabel(usage)}
        </span>
      </span>
    </button>
  );
}
