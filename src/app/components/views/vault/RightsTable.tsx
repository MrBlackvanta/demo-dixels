import { cn } from '../../ui/utils';
import {
  bySoonestExpiry,
  daysLeft,
  expired,
  expiryLabel,
  licenceOf,
  runningOut,
  usageLabel,
  usageOf,
} from './assets';
import type { Wall } from './assets';
import type { Asset } from '../../../lib/data';

interface RightsTableProps {
  assets: Asset[];
  wall: Wall;
  onOpen: (asset: Asset) => void;
  onRenew: (asset: Asset) => void;
}

export function RightsTable({ assets, wall, onOpen, onRenew }: RightsTableProps) {
  const dated = assets
    .filter((asset) => asset.expiresOn !== undefined && asset.status !== 'retired')
    .sort(bySoonestExpiry);

  const gone = dated.filter(expired);
  const soon = dated.filter(runningOut);
  const atRisk = [...gone, ...soon].reduce(
    (sum, asset) => sum + usageOf(asset, wall).pointedAt,
    0,
  );

  const headline = (): string => {
    if (dated.length === 0) return 'Nothing in the vault has a date on it.';

    const counted = `${gone.length} ${gone.length === 1 ? 'file has' : 'files have'} run out and ${soon.length} ${soon.length === 1 ? 'is' : 'are'} within a month of it.`;
    if (atRisk === 0) return `${counted} None of them is pointed at a screen yet.`;

    return `${counted} ${atRisk} ${atRisk === 1 ? 'screen is' : 'screens are'} pointed at them, so that is what goes blank.`;
  };

  return (
    <div className="p-4">
      <p className="mb-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">{headline()}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                File
              </th>
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                Where it came from
              </th>
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                Runs out
              </th>
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                Reading it
              </th>
              <th scope="col" className="dx-eyebrow py-2 font-medium">
                <span className="sr-only">Renew</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {dated.map((asset) => {
              const left = daysLeft(asset) ?? 0;
              const usage = usageOf(asset, wall);

              return (
                <tr key={asset.id} className="border-b border-line last:border-0">
                  <th scope="row" className="max-w-[15rem] py-2.5 pr-4 font-normal">
                    <button
                      type="button"
                      onClick={() => onOpen(asset)}
                      className="block w-full truncate text-left text-[0.8125rem] font-medium text-ink transition-colors duration-[180ms] hover:text-brand-700"
                    >
                      {asset.name}
                    </button>
                    <span className="mt-0.5 block truncate text-[0.6875rem] text-ink-subtle">
                      {asset.credit ?? asset.owner}
                    </span>
                  </th>

                  <td className="py-2.5 pr-4 text-[0.75rem] text-ink-muted">
                    {licenceOf(asset.licence).label}
                  </td>

                  <td className="py-2.5 pr-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                        left < 0
                          ? 'bg-danger/12 text-danger'
                          : runningOut(asset)
                            ? 'bg-warning/12 text-warning'
                            : 'bg-nt-100 text-ink-muted',
                      )}
                    >
                      {expiryLabel(asset)}
                    </span>
                  </td>

                  <td className="py-2.5 pr-4 text-[0.75rem] text-ink-muted">
                    {usageLabel(usage)}
                  </td>

                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onRenew(asset)}
                      className="rounded-sm px-2 py-0.5 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:bg-brand-50"
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
