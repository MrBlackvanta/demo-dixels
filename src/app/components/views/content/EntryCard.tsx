import { History, Languages, MonitorPlay } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import { LOCALES, kindLabel, localeState, reachLabel, statusOf } from './library';
import type { Reach } from './library';
import type { Entry } from '../../../lib/data';

interface EntryCardProps {
  entry: Entry;
  reach: Reach;
  selected: boolean;
  onOpen: () => void;
}

export function EntryCard({ entry, reach, selected, onOpen }: EntryCardProps) {
  const status = statusOf(entry.status);
  const stale = LOCALES.filter((locale) => localeState(entry, locale.id) === 'stale');

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={selected}
      className={cn(
        'flex w-full flex-col gap-2 rounded-sm border p-3.5 text-left transition-all duration-[180ms]',
        selected
          ? 'border-brand-300 bg-brand-50/60 shadow-raise'
          : 'border-line bg-nt-0 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[0.875rem] font-medium leading-snug text-ink">
            {entry.title}
          </span>
          <span className="mt-1 line-clamp-1 block text-[0.75rem] text-ink-muted">
            {entry.summary}
          </span>
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
            status.tone,
          )}
        >
          {status.label}
        </span>
      </span>

      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-muted">
        <span className="rounded-full bg-nt-100 px-1.5 py-0.5">{kindLabel(entry.kind)}</span>
        <span className="flex items-center gap-1">
          <MonitorPlay size={11} aria-hidden="true" />
          {reachLabel(reach)}
        </span>
        <span className="flex items-center gap-1">
          <History size={11} aria-hidden="true" />v{entry.version} · {timeAgo(entry.updatedAt)}
        </span>
        {stale.length > 0 && (
          <span className="flex items-center gap-1 text-warning">
            <Languages size={11} aria-hidden="true" />
            {stale.map((locale) => locale.name).join(' and ')} out of date
          </span>
        )}
      </span>
    </button>
  );
}
