import { ArrowDown, ArrowUp, Minus, Plus, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { sourceLabel, windowLabel } from './paint';
import type { Canvas, Channel, Screen } from '../../../lib/data';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEP = 2;
const MIN_SECONDS = 4;
const MAX_SECONDS = 30;

interface ChannelPanelProps {
  channels: Channel[];
  canvases: Canvas[];
  screens: Screen[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMove: (channel: Channel, from: number, to: number) => void;
  onDrop: (channel: Channel, canvasId: string) => void;
  onAdd: (channel: Channel, canvasId: string) => void;
  onSeconds: (canvas: Canvas, seconds: number) => void;
  onDays: (channel: Channel, days: string[]) => void;
  onWindow: (channel: Channel, patch: Partial<Pick<Channel, 'from' | 'until'>>) => void;
}

export function ChannelPanel({
  channels,
  canvases,
  screens,
  selectedId,
  onSelect,
  onMove,
  onDrop,
  onAdd,
  onSeconds,
  onDays,
  onWindow,
}: ChannelPanelProps) {
  const channel = channels.find((row) => row.id === selectedId) ?? channels[0];
  const byId = new Map(canvases.map((canvas) => [canvas.id, canvas]));
  const playing = channel.canvasIds
    .map((id) => byId.get(id))
    .filter((canvas): canvas is Canvas => canvas !== undefined);
  const spare = canvases.filter((canvas) => !channel.canvasIds.includes(canvas.id));
  const loop = playing.reduce((sum, canvas) => sum + canvas.seconds, 0);
  const on = screens.filter((screen) => screen.channelId === channel.id);

  return (
    <div className="grid gap-0 lg:grid-cols-[14rem_1fr]">
      <div className="border-line lg:border-r">
        <ul className="divide-y divide-line">
          {channels.map((row) => {
            const count = screens.filter((screen) => screen.channelId === row.id).length;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  aria-pressed={row.id === channel.id}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors duration-[180ms]',
                    row.id === channel.id ? 'bg-brand-50' : 'hover:bg-nt-50',
                  )}
                >
                  <span
                    className={cn(
                      'block truncate text-[0.8125rem] font-medium leading-tight',
                      row.id === channel.id ? 'text-brand-700' : 'text-ink',
                    )}
                  >
                    {row.name}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] text-ink-muted">
                    {row.canvasIds.length} canvases · {count} {count === 1 ? 'screen' : 'screens'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-w-0 px-4 py-4">
        <p className="text-[0.9375rem] font-medium leading-tight text-ink">{channel.name}</p>
        <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-ink-muted">
          {channel.purpose}
        </p>
        <p className="mt-2 text-[0.75rem] text-ink-muted">
          One loop takes {Math.floor(loop / 60)}m {loop % 60}s ·{' '}
          {on.length === 0 ? 'no screens yet' : on.map((screen) => screen.name).join(', ')}
        </p>

        <ol className="mt-4 space-y-2">
          {playing.map((canvas, index) => (
            <li
              key={canvas.id}
              className="flex flex-wrap items-center gap-2 rounded-sm border border-line bg-nt-0 px-3 py-2.5"
            >
              <span className="w-4 shrink-0 text-[0.75rem] text-ink-subtle">{index + 1}</span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8125rem] font-medium leading-tight text-ink">
                  {canvas.title}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
                  {sourceLabel(canvas)}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-1 rounded-sm border border-line">
                <button
                  type="button"
                  onClick={() => onSeconds(canvas, Math.max(MIN_SECONDS, canvas.seconds - STEP))}
                  disabled={canvas.seconds <= MIN_SECONDS}
                  aria-label={`Show ${canvas.title} for less time`}
                  className="px-2 py-1 text-ink-muted transition-colors duration-[180ms] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={13} aria-hidden="true" />
                </button>
                <span className="w-9 text-center text-[0.75rem] tabular-nums text-ink">
                  {canvas.seconds}s
                </span>
                <button
                  type="button"
                  onClick={() => onSeconds(canvas, Math.min(MAX_SECONDS, canvas.seconds + STEP))}
                  disabled={canvas.seconds >= MAX_SECONDS}
                  aria-label={`Show ${canvas.title} for longer`}
                  className="px-2 py-1 text-ink-muted transition-colors duration-[180ms] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={13} aria-hidden="true" />
                </button>
              </span>

              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onMove(channel, index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${canvas.title} earlier`}
                  className="rounded-sm p-1.5 text-ink-muted transition-colors duration-[180ms] hover:bg-nt-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(channel, index, index + 1)}
                  disabled={index === playing.length - 1}
                  aria-label={`Move ${canvas.title} later`}
                  className="rounded-sm p-1.5 text-ink-muted transition-colors duration-[180ms] hover:bg-nt-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDrop(channel, canvas.id)}
                  disabled={playing.length === 1}
                  aria-label={`Take ${canvas.title} off ${channel.name}`}
                  className="rounded-sm p-1.5 text-ink-muted transition-colors duration-[180ms] hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ol>

        {spare.length > 0 && (
          <div className="mt-4">
            <p className="dx-eyebrow mb-2">Add to this loop</p>
            <div className="flex flex-wrap gap-1.5">
              {spare.map((canvas) => (
                <button
                  key={canvas.id}
                  type="button"
                  onClick={() => onAdd(channel, canvas.id)}
                  className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[0.75rem] text-ink-muted transition-colors duration-[180ms] hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Plus size={12} aria-hidden="true" />
                  {canvas.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 border-t border-line pt-4">
          <p className="dx-eyebrow mb-2.5">When it plays</p>

          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const picked = channel.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={picked}
                  onClick={() =>
                    onDays(
                      channel,
                      picked
                        ? channel.days.filter((row) => row !== day)
                        : DAYS.filter((row) => channel.days.includes(row) || row === day),
                    )
                  }
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[0.75rem] transition-colors duration-[180ms]',
                    picked
                      ? 'bg-brand-600 font-medium text-nt-0'
                      : 'border border-line text-ink-muted hover:text-ink',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="channel-from" className="mb-1.5 block text-[0.75rem] text-ink-muted">
                Wakes at
              </label>
              <input
                id="channel-from"
                type="time"
                value={channel.from}
                onChange={(event) => onWindow(channel, { from: event.target.value })}
                className="dx-field w-32"
              />
            </div>
            <div>
              <label htmlFor="channel-until" className="mb-1.5 block text-[0.75rem] text-ink-muted">
                Rests at
              </label>
              <input
                id="channel-until"
                type="time"
                value={channel.until}
                onChange={(event) => onWindow(channel, { until: event.target.value })}
                className="dx-field w-32"
              />
            </div>
            <p className="pb-2 text-[0.75rem] text-ink-muted">
              {channel.days.length === 0
                ? 'Never — no days picked.'
                : `${windowLabel(channel)}, ${channel.days.join(', ')}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
