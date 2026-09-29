import { AlertTriangle, Check, Minus } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import { LOCALES, localeState, reachLabel, reachOf, showing } from './library';
import type { LocaleState, Wall } from './library';
import type { Entry, EntryLocale } from '../../../lib/data';

const CELL: Record<LocaleState, { icon: typeof Check; tone: string; word: string }> = {
  ready: { icon: Check, tone: 'bg-success/12 text-success', word: 'Up to date' },
  stale: { icon: AlertTriangle, tone: 'bg-warning/12 text-warning', word: 'Out of date' },
  missing: { icon: Minus, tone: 'bg-nt-100 text-ink-subtle', word: 'Not translated' },
};

interface LanguageMatrixProps {
  entries: Entry[];
  wall: Wall;
  onTranslate: (entry: Entry, locale: EntryLocale) => void;
}

export function LanguageMatrix({ entries, wall, onTranslate }: LanguageMatrixProps) {
  const published = entries.filter(showing);
  const countWhere = (state: LocaleState): number =>
    published.filter((entry) => LOCALES.some((locale) => localeState(entry, locale.id) === state))
      .length;

  const stale = countWhere('stale');
  const missing = countWhere('missing');

  return (
    <div className="p-4">
      <p className="mb-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
        {stale === 0 && missing === 0
          ? `All ${published.length} published entries read the same in every language.`
          : `${stale} of ${published.length} published entries are showing wording older than the English. ${missing} have a language missing altogether.`}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                Entry
              </th>
              <th scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                English
              </th>
              {LOCALES.map((locale) => (
                <th key={locale.id} scope="col" className="dx-eyebrow py-2 pr-4 font-medium">
                  {locale.name}
                </th>
              ))}
              <th scope="col" className="dx-eyebrow py-2 font-medium">
                Reading it
              </th>
            </tr>
          </thead>
          <tbody>
            {published.map((entry) => (
              <tr key={entry.id} className="border-b border-line last:border-0">
                <th scope="row" className="max-w-[16rem] py-2.5 pr-4 font-normal">
                  <span className="block truncate text-[0.8125rem] font-medium text-ink">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] text-ink-subtle">
                    Version {entry.version} · {timeAgo(entry.updatedAt)}
                  </span>
                </th>

                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-medium text-brand-700">
                    Source
                  </span>
                </td>

                {LOCALES.map((locale) => {
                  const state = localeState(entry, locale.id);
                  const cell = CELL[state];

                  return (
                    <td key={locale.id} className="py-2.5 pr-4">
                      <button
                        type="button"
                        onClick={() => onTranslate(entry, locale.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium transition-opacity duration-[180ms] hover:opacity-80',
                          cell.tone,
                        )}
                      >
                        <cell.icon size={10} aria-hidden="true" />
                        {cell.word}
                      </button>
                    </td>
                  );
                })}

                <td className="py-2.5 text-[0.75rem] text-ink-muted">
                  {reachLabel(reachOf(entry, wall))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
