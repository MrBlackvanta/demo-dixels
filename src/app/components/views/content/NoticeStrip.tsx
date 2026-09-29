import { Link } from 'react-router';
import { Megaphone, ScrollText } from 'lucide-react';
import { useCollection } from '../../../lib/store';
import { assets as assetsCol, entries as entriesCol } from '../../../lib/data';
import { heroFor } from '../livecanvas/paint';
import { showing } from './library';

export function NoticeStrip() {
  const published = useCollection(entriesCol);
  const assets = useCollection(assetsCol);

  const worth = published
    .filter((entry) => entry.surfaces.includes('today') && showing(entry))
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'notice' ? -1 : 1))
    .slice(0, 3);

  if (worth.length === 0) return null;

  return (
    <section aria-labelledby="worth-heading" className="mb-5">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 id="worth-heading" className="dx-eyebrow">
          Worth knowing
        </h3>
        <Link
          to="/content"
          className="text-[0.75rem] text-ink-muted transition-colors duration-[180ms] hover:text-brand-700"
        >
          Published from Content
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {worth.map((entry) => {
          const Glyph = entry.kind === 'notice' ? Megaphone : ScrollText;
          const hero = heroFor(entry, assets);

          return (
            <li key={entry.id} className="dx-card flex items-start gap-3 px-4 py-3.5">
              {hero !== undefined && (
                <img
                  src={hero}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 shrink-0 rounded-sm object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="flex items-start gap-2 text-[0.875rem] font-medium leading-snug text-ink">
                  <Glyph size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
                  {entry.title}
                </p>
                <p className="mt-1.5 line-clamp-2 pl-[1.375rem] text-[0.8125rem] leading-relaxed text-ink-muted">
                  {entry.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
