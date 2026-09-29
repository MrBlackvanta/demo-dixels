import { Pencil, Zap } from 'lucide-react';
import { cn } from '../../ui/utils';
import { ScreenCanvas } from './ScreenCanvas';
import { isLiveSource, sourceName } from './paint';
import type { Canvas, Channel } from '../../../lib/data';
import type { Board } from './paint';
import { paint } from './paint';

interface CanvasLibraryProps {
  canvases: Canvas[];
  channels: Channel[];
  board: Board;
  onEdit: (canvas: Canvas) => void;
}

export function CanvasLibrary({ canvases, channels, board, onEdit }: CanvasLibraryProps) {
  return (
    <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {canvases.map((canvas) => {
        const used = channels.filter((channel) => channel.canvasIds.includes(canvas.id));
        const live = isLiveSource(canvas.source);

        return (
          <li key={canvas.id} className="rounded-sm border border-line bg-nt-0 p-3">
            <ScreenCanvas frame={paint(canvas, board)} shape="landscape" size="tile" />

            <div className="mt-2.5 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-medium leading-tight text-ink">
                  {canvas.title}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-ink-muted">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
                      live ? 'bg-brand-50 text-brand-700' : 'bg-nt-100 text-ink-muted',
                    )}
                  >
                    {live && <Zap size={9} aria-hidden="true" />}
                    {sourceName(canvas.source)}
                  </span>
                  <span>{canvas.seconds}s</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEdit(canvas)}
                aria-label={`Edit ${canvas.title}`}
                className="shrink-0 rounded-sm p-1.5 text-ink-muted transition-colors duration-[180ms] hover:bg-nt-50 hover:text-ink"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-muted">
              {used.length === 0
                ? 'On no channel yet.'
                : `Playing on ${used.map((channel) => channel.name).join(', ')}.`}{' '}
              Last touched by {canvas.updatedBy}.
            </p>
          </li>
        );
      })}
    </ul>
  );
}
