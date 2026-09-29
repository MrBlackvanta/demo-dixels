import { MonitorPause, MonitorPlay, Radio, SkipForward, Sun } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import { ScreenCanvas } from './ScreenCanvas';
import { sourceLabel, windowLabel } from './paint';
import type { Canvas, Channel, Screen } from '../../../lib/data';
import type { Frame } from './paint';

interface StageRailProps {
  screen: Screen;
  channel?: Channel;
  frame: Frame;
  canvas?: Canvas;
  queue: Canvas[];
  progress: number;
  secondsLeft: number;
  takeover?: { canvas: Canvas; until: string };
  onSkip: () => void;
  onToggleRest: () => void;
  onBrightness: (value: number) => void;
  onClearTakeover: () => void;
}

export function StageRail({
  screen,
  channel,
  frame,
  canvas,
  queue,
  progress,
  secondsLeft,
  takeover,
  onSkip,
  onToggleRest,
  onBrightness,
  onClearTakeover,
}: StageRailProps) {
  const dark = screen.status === 'dark';

  return (
    <div className="dx-card divide-y divide-line">
      <div className="px-4 py-4">
        <p className="dx-eyebrow mb-1.5">On this screen now</p>
        <p className="text-[0.9375rem] font-medium leading-tight text-ink">{screen.name}</p>
        <p className="mt-1 text-[0.75rem] text-ink-muted">
          {screen.level} · {screen.shape === 'portrait' ? 'Portrait' : 'Landscape'} · synced{' '}
          {timeAgo(screen.syncedAt)}
        </p>

        <div className={cn('mt-3.5', screen.shape === 'portrait' && 'mx-auto max-w-[11rem]')}>
          <ScreenCanvas
            frame={frame}
            shape={screen.shape}
            size="stage"
            dark={dark}
            progress={dark ? undefined : progress}
          />
        </div>

        {screen.fault !== undefined && (
          <p className="mt-3 rounded-sm bg-warning-bg px-3 py-2 text-[0.75rem] leading-relaxed text-ink">
            {screen.fault}
          </p>
        )}

        {takeover !== undefined && (
          <div className="mt-3 flex items-start gap-2 rounded-sm bg-brand-50 px-3 py-2.5">
            <Radio size={14} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.75rem] font-medium text-ink">A rule took this screen over</p>
              <p className="mt-0.5 text-[0.75rem] text-ink-muted">
                {takeover.canvas.title} holds it until {takeover.until}.
              </p>
              <button type="button" onClick={onClearTakeover} className="dx-btn-ghost mt-1.5">
                Give it back to the channel
              </button>
            </div>
          </div>
        )}

        {!dark && canvas !== undefined && (
          <p className="mt-3 text-[0.75rem] text-ink-muted">
            <span className="font-medium text-ink">{canvas.title}</span> · {sourceLabel(canvas)}{' '}
            · {secondsLeft}s left
          </p>
        )}
      </div>

      {!dark && channel !== undefined && queue.length > 0 && (
        <div className="px-4 py-4">
          <p className="dx-eyebrow mb-2.5">Up next on {channel.name}</p>
          <ol className="space-y-1.5">
            {queue.map((row, index) => (
              <li key={row.id} className="flex items-baseline gap-2 text-[0.75rem]">
                <span className="w-3 shrink-0 text-ink-subtle">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{row.title}</span>
                <span className="shrink-0 text-ink-muted">{row.seconds}s</span>
              </li>
            ))}
          </ol>
          <p className="mt-2.5 text-[0.75rem] text-ink-muted">
            Loops {windowLabel(channel)} on {channel.days.join(', ')}.
          </p>
        </div>
      )}

      <div className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={dark}
            className="dx-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipForward size={14} aria-hidden="true" />
            Skip ahead
          </button>
          <button
            type="button"
            onClick={onToggleRest}
            disabled={dark}
            className="dx-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {screen.status === 'resting' ? (
              <MonitorPlay size={14} aria-hidden="true" />
            ) : (
              <MonitorPause size={14} aria-hidden="true" />
            )}
            {screen.status === 'resting' ? 'Wake it up' : 'Let it rest'}
          </button>
        </div>

        <div>
          <label
            htmlFor="screen-brightness"
            className="mb-1.5 flex items-center justify-between text-[0.75rem] text-ink-muted"
          >
            <span className="flex items-center gap-1.5">
              <Sun size={13} aria-hidden="true" />
              Brightness
            </span>
            <span className="font-medium text-ink">{screen.brightness}%</span>
          </label>
          <input
            id="screen-brightness"
            type="range"
            min={0}
            max={100}
            step={5}
            value={screen.brightness}
            disabled={dark}
            onChange={(event) => onBrightness(Number(event.target.value))}
            className="w-full accent-brand-600 disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
}
