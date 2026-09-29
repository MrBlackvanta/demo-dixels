import { cn } from '../../ui/utils';
import { duration } from '../../../lib/format';
import { WORK_DAY } from '../../../lib/workload';

interface CapacityBarProps {
  minutes: number;
  label?: string;
  compact?: boolean;
}

export function CapacityBar({ minutes, label, compact = false }: CapacityBarProps) {
  const ratio = minutes / WORK_DAY;
  const over = minutes > WORK_DAY;
  const filled = Math.min(100, Math.round(ratio * 100));
  const spill = over ? Math.min(100, Math.round(((minutes - WORK_DAY) / WORK_DAY) * 100)) : 0;

  return (
    <div>
      {label !== undefined && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.8125rem] font-medium text-ink">{label}</span>
          <span
            className={cn(
              'shrink-0 text-[0.75rem] tabular-nums',
              over ? 'font-medium text-warning' : 'text-ink-muted',
            )}
          >
            {duration(minutes)}
          </span>
        </div>
      )}

      <div
        role="meter"
        aria-valuenow={minutes}
        aria-valuemin={0}
        aria-valuemax={WORK_DAY}
        aria-valuetext={`${duration(minutes)} of a ${duration(WORK_DAY)} day`}
        aria-label={label ? `${label} committed today` : 'Committed today'}
        className={cn(
          'flex w-full overflow-hidden rounded-full bg-nt-100',
          compact ? 'h-1' : 'h-1.5',
        )}
      >
        <span
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-dx',
            over ? 'bg-warning' : filled > 80 ? 'bg-brand-500' : 'bg-brand-400',
          )}
          style={{ width: `${filled}%` }}
        />
      </div>

      {over && !compact && (
        <p className="mt-1.5 text-[0.6875rem] text-warning">
          {duration(minutes - WORK_DAY)} past a {duration(WORK_DAY)} day — {spill}% over
        </p>
      )}
    </div>
  );
}
