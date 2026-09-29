import { BookOpenCheck, Megaphone, ScrollText } from 'lucide-react';
import { ScreenCanvas } from '../livecanvas/ScreenCanvas';
import { entryFrame } from '../livecanvas/paint';
import type { Entry, EntrySurface } from '../../../lib/data';

interface SurfacePreviewProps {
  entry: Entry;
  surface: EntrySurface;
  hero?: string;
}

export function SurfacePreview({ entry, surface, hero }: SurfacePreviewProps) {
  if (surface === 'livecanvas') {
    return (
      <ScreenCanvas
        frame={entryFrame(entry, entry.kind === 'notice' ? 'warm' : 'brand', undefined, hero)}
        shape="landscape"
        size="tile"
      />
    );
  }

  if (surface === 'today') {
    const Glyph = entry.kind === 'notice' ? Megaphone : ScrollText;

    return (
      <div className="rounded-sm border border-line bg-nt-0 px-3.5 py-3">
        <p className="dx-eyebrow mb-2">Worth knowing</p>
        <div className="flex items-start gap-2.5">
          {hero !== undefined && (
            <img
              src={hero}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-10 w-10 shrink-0 rounded-sm object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="flex items-start gap-2 text-[0.8125rem] font-medium leading-snug text-ink">
              <Glyph size={13} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
              {entry.title}
            </p>
            <p className="mt-1.5 line-clamp-2 pl-[1.3125rem] text-[0.75rem] leading-relaxed text-ink-muted">
              {entry.body}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-line bg-nt-50 px-3.5 py-3">
      <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
        <BookOpenCheck size={12} aria-hidden="true" />
        Before you raise this
      </p>
      <div className="rounded-md bg-nt-0 px-3 py-2.5">
        <p className="text-[0.8125rem] font-medium leading-snug text-brand-700">{entry.title}</p>
        <p className="mt-1.5 line-clamp-3 text-[0.75rem] leading-relaxed text-ink-muted">
          {entry.body}
        </p>
      </div>
      <p className="mt-2 text-[0.75rem] text-ink-subtle">
        Offered to anyone whose words match {entry.keywords.slice(0, 3).join(', ')}.
      </p>
    </div>
  );
}
