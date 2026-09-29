import { Link } from 'react-router';
import { ArrowUpRight, MonitorPlay, ScrollText } from 'lucide-react';
import { ScreenCanvas } from '../livecanvas/ScreenCanvas';
import { assetFrame, entryFrame } from '../livecanvas/paint';
import { usable, weight } from './assets';
import type { Wall } from './assets';
import type { Asset, Canvas, Entry } from '../../../lib/data';

interface UsagePanelProps {
  assets: Asset[];
  wall: Wall;
  onBind: (canvas: Canvas, assetId: string) => void;
  onOpen: (asset: Asset) => void;
}

export function UsagePanel({ assets, wall, onBind, onOpen }: UsagePanelProps) {
  const posters = wall.canvases.filter((canvas) => canvas.source === 'poster');
  const pickable = assets.filter((asset) => asset.kind !== 'document' && usable(asset));
  const heroes = wall.entries.filter((entry) => entry.heroId !== undefined);

  const screensBehind = (canvas: Canvas): number => {
    const carrying = new Set(
      wall.channels
        .filter((channel) => channel.canvasIds.includes(canvas.id))
        .map((channel) => channel.id),
    );
    return wall.screens.filter(
      (screen) => screen.status !== 'dark' && carrying.has(screen.channelId),
    ).length;
  };

  const heroOf = (entry: Entry): Asset | undefined =>
    assets.find((asset) => asset.id === entry.heroId);

  return (
    <div className="space-y-5 p-4">
      <section>
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="dx-eyebrow">LiveCanvas · posters</p>
          <Link
            to="/livecanvas"
            className="flex items-center gap-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
          >
            See the wall
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">
          A poster is a canvas pointed at one file in here. Swap the file and every screen carrying
          it changes on its next loop — and the day the licence runs out it stops on its own.
        </p>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {posters.map((canvas) => {
            const bound = assets.find((asset) => asset.id === canvas.assetId);
            const reach = screensBehind(canvas);

            return (
              <li key={canvas.id} className="rounded-sm border border-line bg-nt-0 p-3">
                {bound === undefined || !usable(bound) ? (
                  <div className="grid aspect-video place-items-center rounded-[0.25rem] border border-dashed border-line bg-nt-50 px-3 text-center text-[0.75rem] text-ink-muted">
                    {bound === undefined
                      ? 'No artwork picked yet'
                      : `Holding — ${bound.name} cannot go out`}
                  </div>
                ) : (
                  <ScreenCanvas frame={assetFrame(bound, canvas)} shape="landscape" size="tile" />
                )}

                <p className="mt-2.5 truncate text-[0.8125rem] font-medium text-ink">
                  {canvas.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                  <MonitorPlay size={11} aria-hidden="true" />
                  {reach === 0 ? 'On no screen yet' : `On ${reach} ${reach === 1 ? 'screen' : 'screens'}`}
                  {bound === undefined ? '' : ` · ${weight(bound.bytes)}`}
                </p>

                <label className="mt-2 block">
                  <span className="sr-only">What {canvas.title} shows</span>
                  <select
                    value={canvas.assetId ?? ''}
                    onChange={(event) => onBind(canvas, event.target.value)}
                    className="dx-field h-8 text-[0.75rem]"
                  >
                    <option value="">Nothing yet</option>
                    {pickable.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="dx-eyebrow">Content · behind the words</p>
          <Link
            to="/content"
            className="flex items-center gap-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
          >
            Go and look
            <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
        <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">
          An entry can carry a picture, and it travels wherever the entry does — onto the wall, onto
          the home page, without anybody uploading it twice.
        </p>

        {heroes.length === 0 ? (
          <p className="rounded-sm border border-dashed border-line px-3.5 py-4 text-[0.8125rem] text-ink-muted">
            No entry is carrying a picture yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {heroes.map((entry) => {
              const hero = heroOf(entry);

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => hero !== undefined && onOpen(hero)}
                    className="block w-full text-left transition-transform duration-[180ms] hover:-translate-y-0.5"
                  >
                    <ScreenCanvas
                      frame={entryFrame(
                        entry,
                        entry.kind === 'notice' ? 'warm' : 'brand',
                        undefined,
                        hero !== undefined && usable(hero) ? hero.url : undefined,
                      )}
                      shape="landscape"
                      size="tile"
                    />
                    <p className="mt-2 flex items-center gap-1.5 truncate text-[0.75rem] text-ink-muted">
                      <ScrollText size={11} aria-hidden="true" />
                      {hero?.name ?? 'Picture missing'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
