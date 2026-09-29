import { Link } from 'react-router';
import { ArrowUpRight, MonitorPlay } from 'lucide-react';
import { cn } from '../../ui/utils';
import { SurfacePreview } from './SurfacePreview';
import { SURFACES, showing } from './library';
import type { Wall } from './library';
import type { Canvas, Entry } from '../../../lib/data';

interface DeliveryPanelProps {
  entries: Entry[];
  wall: Wall;
  onBind: (canvas: Canvas, entryId: string) => void;
  onOpen: (entry: Entry) => void;
}

export function DeliveryPanel({ entries, wall, onBind, onOpen }: DeliveryPanelProps) {
  const noticeBoards = wall.canvases.filter((canvas) => canvas.source === 'notice');
  const bindable = entries.filter(
    (entry) => entry.surfaces.includes('livecanvas') && showing(entry),
  );

  const screensBehind = (canvas: Canvas): number => {
    const carrying = wall.channels.filter((channel) => channel.canvasIds.includes(canvas.id));
    const ids = new Set(carrying.map((channel) => channel.id));
    return wall.screens.filter((screen) => screen.status !== 'dark' && ids.has(screen.channelId))
      .length;
  };

  return (
    <div className="space-y-5 p-4">
      <section>
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="dx-eyebrow">LiveCanvas · the notice boards</p>
          <Link
            to="/livecanvas"
            className="flex items-center gap-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
          >
            See the wall
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">
          Each board is pointed at one entry. Change the entry and every screen carrying that board
          says the new thing on its next loop — nobody opens LiveCanvas to retype it.
        </p>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {noticeBoards.map((canvas) => {
            const bound = entries.find((entry) => entry.id === canvas.entryId);
            const reach = screensBehind(canvas);

            return (
              <li key={canvas.id} className="rounded-sm border border-line bg-nt-0 p-3">
                {bound === undefined || !showing(bound) ? (
                  <div className="grid aspect-video place-items-center rounded-[0.25rem] border border-dashed border-line bg-nt-50 px-3 text-center text-[0.75rem] text-ink-muted">
                    {bound === undefined
                      ? 'Typed by hand in LiveCanvas'
                      : `Holding — ${bound.title} is not published`}
                  </div>
                ) : (
                  <SurfacePreview entry={bound} surface="livecanvas" />
                )}

                <p className="mt-2.5 truncate text-[0.8125rem] font-medium text-ink">
                  {canvas.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                  <MonitorPlay size={11} aria-hidden="true" />
                  {reach === 0 ? 'On no screen yet' : `On ${reach} ${reach === 1 ? 'screen' : 'screens'}`}
                </p>

                <label className="mt-2 block">
                  <span className="sr-only">What {canvas.title} shows</span>
                  <select
                    value={canvas.entryId ?? ''}
                    onChange={(event) => onBind(canvas, event.target.value)}
                    className="dx-field h-8 text-[0.75rem]"
                  >
                    <option value="">Typed by hand</option>
                    {bindable.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {SURFACES.filter((surface) => surface.id !== 'livecanvas').map((surface) => {
        const pulling = entries.filter(
          (entry) =>
            entry.surfaces.includes(surface.id) &&
            (surface.id === 'resolve' ? entry.status === 'live' : showing(entry)),
        );

        return (
          <section key={surface.id}>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
              <p className="dx-eyebrow">
                {surface.product} · {surface.name}
              </p>
              <Link
                to={surface.path}
                className="flex items-center gap-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
              >
                Go and look
                <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            </div>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">{surface.blurb}</p>

            {pulling.length === 0 ? (
              <p className="rounded-sm border border-dashed border-line px-3.5 py-4 text-[0.8125rem] text-ink-muted">
                Nothing published to this one yet.
              </p>
            ) : (
              <ul
                className={cn(
                  'grid gap-3',
                  surface.id === 'resolve' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-3',
                )}
              >
                {pulling.slice(0, 6).map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(entry)}
                      className="block w-full text-left transition-transform duration-[180ms] hover:-translate-y-0.5"
                    >
                      <SurfacePreview entry={entry} surface={surface.id} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {pulling.length > 6 && (
              <p className="mt-2 text-[0.75rem] text-ink-subtle">
                and {pulling.length - 6} more reading from the same place.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
