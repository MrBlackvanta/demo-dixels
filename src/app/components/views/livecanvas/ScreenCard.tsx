import { Radio } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import { ScreenCanvas } from './ScreenCanvas';
import type { Screen, ScreenStatus } from '../../../lib/data';
import type { Frame } from './paint';

const STATUS: Record<ScreenStatus, { label: string; dot: string; text: string }> = {
  live: { label: 'Playing', dot: 'bg-success', text: 'text-success' },
  resting: { label: 'Resting', dot: 'bg-ink-subtle', text: 'text-ink-muted' },
  dark: { label: 'No answer', dot: 'bg-danger', text: 'text-danger' },
};

interface ScreenCardProps {
  screen: Screen;
  frame: Frame;
  channelName: string;
  progress: number;
  selected: boolean;
  takenOver: boolean;
  onSelect: () => void;
}

export function ScreenCard({
  screen,
  frame,
  channelName,
  progress,
  selected,
  takenOver,
  onSelect,
}: ScreenCardProps) {
  const status = STATUS[screen.status];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group flex flex-col gap-2.5 rounded-sm border p-2.5 text-left transition-all duration-[180ms]',
        selected
          ? 'border-brand-300 bg-brand-50/60 shadow-raise'
          : 'border-line bg-nt-0 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raise',
      )}
    >
      <span className="relative block aspect-video w-full overflow-hidden rounded-[0.25rem] bg-nt-950">
        <span
          className={cn(
            'absolute inset-y-0 left-1/2 -translate-x-1/2',
            screen.shape === 'portrait' ? 'aspect-[9/16]' : 'w-full',
          )}
        >
          <ScreenCanvas
            frame={frame}
            shape={screen.shape}
            size="tile"
            fill
            dark={screen.status === 'dark'}
            progress={screen.status === 'live' ? progress : undefined}
          />
        </span>
        {takenOver && (
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-nt-0/92 px-1.5 py-0.5 text-[0.5625rem] font-medium text-brand-700 backdrop-blur-sm">
            <Radio size={9} aria-hidden="true" />
            Taken over
          </span>
        )}
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dot)} aria-hidden="true" />
          <span className="truncate text-[0.8125rem] font-medium leading-tight text-ink">
            {screen.name}
          </span>
        </span>
        <span className="mt-1 block truncate text-[0.6875rem] text-ink-muted">{channelName}</span>
        <span className={cn('mt-0.5 block text-[0.6875rem]', status.text)}>
          {status.label} · synced {timeAgo(screen.syncedAt)}
        </span>
      </span>
    </button>
  );
}
