import { useState } from 'react';
import { FileSpreadsheet, FileText, Play } from 'lucide-react';
import { cn } from '../../ui/utils';
import { runtime } from './assets';
import type { Asset } from '../../../lib/data';

const SHEETS = ['XLSX', 'CSV'];

interface AssetThumbProps {
  asset: Asset;
  ratio?: string;
  rounded?: string;
}

export function AssetThumb({ asset, ratio = 'aspect-[4/3]', rounded = 'rounded-t-sm' }: AssetThumbProps) {
  const [loaded, setLoaded] = useState(false);

  if (asset.kind === 'document' || asset.url === '') {
    const Glyph = asset.kind === 'video' ? Play : SHEETS.includes(asset.format) ? FileSpreadsheet : FileText;

    return (
      <span
        className={cn(
          'grid w-full place-items-center overflow-hidden bg-gradient-to-br from-nt-50 to-nt-100',
          ratio,
          rounded,
        )}
      >
        <span className="text-center">
          <Glyph size={22} aria-hidden="true" className="mx-auto text-ink-subtle" />
          <span className="mt-1.5 block text-[0.6875rem] font-medium tracking-[0.1em] text-ink-muted">
            {asset.format}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={cn('relative block w-full overflow-hidden bg-nt-100', ratio, rounded)}>
      <span
        className="absolute inset-0 bg-gradient-to-br from-brand-100 via-nt-100 to-grn-100"
        aria-hidden="true"
      />
      <img
        src={asset.url}
        alt=""
        loading="lazy"
        decoding="async"
        ref={(node) => {
          if (node?.complete === true) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        className={cn(
          'relative h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />

      {asset.kind === 'video' && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-nt-950/55 backdrop-blur-sm">
            <Play size={13} aria-hidden="true" className="ml-0.5 fill-nt-0 text-nt-0" />
          </span>
        </span>
      )}

      {asset.kind === 'video' && asset.seconds !== undefined && (
        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-nt-950/70 px-1.5 py-0.5 text-[0.625rem] font-medium text-nt-0">
          {runtime(asset.seconds)}
        </span>
      )}
    </span>
  );
}
