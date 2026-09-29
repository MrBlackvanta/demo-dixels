import { AlertTriangle, Lock, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { VERDICT_LABEL, comfortOf } from '../../../lib/climate';
import type { Standing } from '../../../lib/climate';
import type { Space, Zone } from '../../../lib/data';
import { SIGN_DOT, VERDICT_TONE, degrees } from './comfort';

const sparkline = (trend: number[]): string => {
  if (trend.length < 2) return '';
  const low = Math.min(...trend);
  const high = Math.max(...trend);
  const span = high - low < 0.5 ? 0.5 : high - low;
  return trend
    .map((value, index) => {
      const x = (index / (trend.length - 1)) * 100;
      const y = 22 - ((value - low) / span) * 18;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};

interface ZoneCardProps {
  zone: Zone;
  space: Space;
  standing: Standing;
  voters: number;
  active: boolean;
  onOpen: () => void;
}

export function ZoneCard({ zone, space, standing, voters, active, onOpen }: ZoneCardProps) {
  const verdict = comfortOf(zone.temp);
  const off = Math.abs(zone.temp - zone.target) >= 0.15;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={active}
      className={cn(
        'flex flex-col rounded-lg border bg-nt-0 p-4 text-left transition-all duration-[180ms]',
        active
          ? 'border-brand-600 shadow-raise'
          : 'border-line hover:-translate-y-px hover:border-brand-300 hover:shadow-raise',
        space.offline && 'opacity-60',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[0.875rem] font-medium text-ink">{space.name}</p>
          <p className="mt-0.5 truncate text-[0.6875rem] text-ink-muted">
            {space.level} · {space.kind}
          </p>
        </div>
        <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', SIGN_DOT[zone.sign])} />
      </div>

      <div className="mb-2 flex items-end gap-2">
        <span className="text-[1.5rem] font-medium leading-none tracking-[-0.035em] tabular-nums text-ink">
          {degrees(zone.temp)}
        </span>
        {off && (
          <span className="pb-0.5 text-[0.6875rem] tabular-nums text-ink-muted">
            → {degrees(zone.target)}
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="mb-3 h-6 w-full"
      >
        <path
          d={sparkline(zone.trend)}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={verdict === 'right' ? 'stroke-grn-400' : 'stroke-warning'}
        />
      </svg>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[0.625rem]',
            VERDICT_TONE[verdict],
          )}
        >
          {VERDICT_LABEL[verdict]}
        </span>

        {zone.fault !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full border border-danger/35 bg-danger-bg px-2 py-0.5 text-[0.625rem] text-danger">
            <AlertTriangle size={9} aria-hidden="true" />
            Fault
          </span>
        )}

        {standing.authority === 'held' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[0.625rem] text-ink-muted">
            <Lock size={9} aria-hidden="true" />
            {standing.holder?.organizer}
          </span>
        )}

        {zone.occupancy > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[0.625rem] text-ink-muted">
            <Users size={9} aria-hidden="true" />
            {zone.occupancy}
          </span>
        )}

        {voters > 0 && (
          <span className="rounded-full border border-line px-2 py-0.5 text-[0.625rem] text-ink-muted">
            {voters} said
          </span>
        )}
      </div>
    </button>
  );
}
