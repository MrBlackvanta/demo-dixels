import { useMemo, useState } from 'react';
import { Inbox, Languages, Library, Plus, Send, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import {
  CURRENT_USER,
  canvases as canvasesCol,
  channels as channelsCol,
  entries as entriesCol,
  screens as screensCol,
} from '../../../lib/data';
import { todayKey } from '../../../lib/format';
import type { Canvas, Entry, EntryLocale, EntrySurface } from '../../../lib/data';
import { DeliveryPanel } from './DeliveryPanel';
import { EntryCard } from './EntryCard';
import { EntryDialog } from './EntryDialog';
import { LanguageMatrix } from './LanguageMatrix';
import { NewEntryDialog } from './NewEntryDialog';
import type { NewEntry } from './NewEntryDialog';
import { ReviewQueue } from './ReviewQueue';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import {
  LOCALES,
  NO_FILTERS,
  byUrgency,
  localeOf,
  localeState,
  match,
  reachOf,
  revised,
  showing,
} from './library';
import type { Edit, Filters, Wall } from './library';

const me = CURRENT_USER.name;

const slugOf = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

export function Content() {
  const entries = useCollection(entriesCol);
  const canvases = useCollection(canvasesCol);
  const channels = useCollection(channelsCol);
  const screens = useCollection(screensCol);

  const [lens, setLens] = useState('library');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openLocale, setOpenLocale] = useState<EntryLocale | undefined>(undefined);
  const [writing, setWriting] = useState(false);

  const openEntry = (id: string, locale?: EntryLocale) => {
    setOpenId(id);
    setOpenLocale(locale);
  };

  const wall: Wall = useMemo(
    () => ({ canvases, channels, screens }),
    [canvases, channels, screens],
  );

  const open = entries.find((entry) => entry.id === openId) ?? null;

  const waiting = useMemo(
    () => entries.filter((entry) => entry.status === 'review' && entry.reviewer === me),
    [entries],
  );

  const shown = useMemo(
    () => entries.filter((entry) => match(entry, filters)).sort(byUrgency),
    [entries, filters],
  );

  const screensCarrying = useMemo(() => {
    const ids = new Set<string>();
    entries.filter(showing).forEach((entry) => {
      const carrying = canvases
        .filter((canvas) => canvas.entryId === entry.id)
        .map((canvas) => canvas.id);
      channels
        .filter((channel) => channel.canvasIds.some((id) => carrying.includes(id)))
        .forEach((channel) => {
          screens
            .filter((screen) => screen.status !== 'dark' && screen.channelId === channel.id)
            .forEach((screen) => ids.add(screen.id));
        });
    });
    return ids.size;
  }, [entries, canvases, channels, screens]);

  const behind = useMemo(
    () =>
      entries.filter(
        (entry) =>
          showing(entry) && LOCALES.some((locale) => localeState(entry, locale.id) === 'stale'),
      ).length,
    [entries],
  );

  const stats = [
    { label: 'Published right now', value: entries.filter(showing).length, tone: 'neutral' as const },
    { label: 'Waiting on your read', value: waiting.length, tone: 'brand' as const },
    { label: 'Screens carrying your words', value: screensCarrying, tone: 'neutral' as const },
    { label: 'Out of date in another language', value: behind, tone: 'warning' as const },
  ];

  const lenses: Lens[] = [
    { id: 'library', label: 'Library', icon: Library, count: entries.length },
    { id: 'review', label: 'Waiting on you', icon: Inbox, count: waiting.length },
    { id: 'delivery', label: 'Where it lands', icon: Share2 },
    { id: 'languages', label: 'Languages', icon: Languages, count: behind },
  ];

  const save = (entry: Entry, edit: Edit) => {
    entriesCol.update(entry.id, revised(entry, edit, me));
    const reach = reachOf(entry, wall);
    toast.success(`Version ${entry.version + 1} saved`, {
      description:
        reach.screens > 0
          ? `${reach.screens} screens pick it up on their next loop.`
          : 'Nothing is carrying it yet, so nothing changes out there.',
    });
  };

  const restore = (entry: Entry, version: number) => {
    const revision = entry.history.find((row) => row.version === version);
    if (revision === undefined) return;

    entriesCol.update(
      entry.id,
      revised(
        entry,
        {
          title: revision.title,
          summary: entry.summary,
          body: revision.body,
          note: `Brought version ${version} back`,
        },
        me,
      ),
    );
    toast.success(`Version ${version} is the live wording again`, {
      description: `Kept as version ${entry.version + 1} — nothing in between was thrown away.`,
    });
  };

  const translate = (entry: Entry, locale: EntryLocale, title: string, body: string) => {
    const others = entry.translations.filter((row) => row.locale !== locale);
    entriesCol.update(entry.id, {
      translations: [
        ...others,
        { locale, title, body, fromVersion: entry.version, updatedAt: new Date().toISOString(), by: me },
      ],
    });
    toast.success(`${localeOf(locale).name} is up to date`, {
      description: `Tied to version ${entry.version}, so the next English edit will flag it again.`,
    });
  };

  const approve = (entry: Entry) => {
    entriesCol.update(entry.id, { status: 'live', reviewer: undefined, liveFrom: todayKey() });
    const reach = reachOf({ ...entry, status: 'live' }, wall);
    toast.success(`${entry.title} is live`, {
      description:
        reach.screens > 0
          ? `Now on ${reach.screens} screens and the home page.`
          : 'Published. Point a notice board at it to put it on a screen.',
    });
  };

  const sendBack = (entry: Entry, note: string) => {
    entriesCol.update(entry.id, { status: 'draft', reviewer: undefined, reviewNote: note });
    toast(`Back to ${entry.owner}`, { description: note });
  };

  const create = (draft: NewEntry) => {
    const made = entriesCol.create({
      title: draft.title,
      slug: slugOf(draft.title),
      kind: draft.kind,
      status: 'draft',
      summary: draft.summary === '' ? 'Written today, not published yet.' : draft.summary,
      body: draft.body,
      owner: me,
      surfaces: draft.surfaces,
      keywords: draft.title.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 3),
      version: 1,
      history: [],
      translations: [],
      reads: 0,
    });
    setWriting(false);
    openEntry(made.id);
    setLens('library');
    toast.success(`${draft.title} is in the library`, {
      description: 'Send it for a read when you want it out there.',
    });
  };

  const sendForReview = (entry: Entry) => {
    entriesCol.update(entry.id, { status: 'review', reviewer: me });
    toast(`${entry.title} is with ${me}`, { description: 'It shows under Waiting on you.' });
  };

  const bind = (canvas: Canvas, entryId: string) => {
    canvasesCol.update(canvas.id, { entryId: entryId === '' ? undefined : entryId });
    const entry = entries.find((row) => row.id === entryId);
    toast.success(
      entry === undefined ? `${canvas.title} is hand-typed again` : `${canvas.title} now shows ${entry.title}`,
      { description: 'Every screen carrying that board changes on its next loop.' },
    );
  };

  const setSurfaces = (entry: Entry, surfaces: EntrySurface[]) =>
    entriesCol.update(entry.id, { surfaces });

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">Content · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">Write it once, and it is right everywhere</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              An entry is not a page. It is one piece of writing that the lobby wall, the home page
              and the help desk all read — so you can see, while you type, every place the words
              will land.
            </p>
          </div>

          <button type="button" onClick={() => setWriting(true)} className="dx-btn-primary">
            <Plus size={15} aria-hidden="true" />
            Write something
          </button>
        </div>

        <section
          aria-label="The library at a glance"
          className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="dx-card px-5 py-4">
              <CountUp
                value={stat.value}
                className={cn(
                  'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                  stat.tone === 'brand' && stat.value > 0 && 'text-brand-600',
                  stat.tone === 'warning' && stat.value > 0 && 'text-warning',
                  (stat.tone === 'neutral' || stat.value === 0) && 'text-ink',
                )}
              />
              <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_18rem]">
          <section aria-labelledby="content-heading" className="dx-card min-w-0 overflow-hidden">
            <h3 id="content-heading" className="sr-only">
              Everything written here
            </h3>

            <Toolbar
              lenses={lenses}
              lens={lens}
              onLens={setLens}
              filters={filters}
              onFilters={setFilters}
              withFilters={lens === 'library'}
            />

            {lens === 'library' &&
              (shown.length === 0 ? (
                <EmptyState
                  icon={Library}
                  title="Nothing here matches what you are looking for."
                  actionLabel="Clear the filters"
                  onAction={() => setFilters(NO_FILTERS)}
                />
              ) : (
                <ul className="grid gap-2.5 p-4 sm:grid-cols-2">
                  {shown.map((entry) => (
                    <li key={entry.id}>
                      <EntryCard
                        entry={entry}
                        reach={reachOf(entry, wall)}
                        selected={entry.id === openId}
                        onOpen={() => openEntry(entry.id)}
                      />
                    </li>
                  ))}
                </ul>
              ))}

            {lens === 'review' && (
              <ReviewQueue
                waiting={waiting}
                onApprove={approve}
                onSendBack={sendBack}
                onOpen={(entry) => openEntry(entry.id)}
                onBrowse={() => setLens('library')}
              />
            )}

            {lens === 'delivery' && (
              <DeliveryPanel
                entries={entries}
                wall={wall}
                onBind={bind}
                onOpen={(entry) => openEntry(entry.id)}
              />
            )}

            {lens === 'languages' && (
              <LanguageMatrix
                entries={entries}
                wall={wall}
                onTranslate={(entry, locale) => openEntry(entry.id, locale)}
              />
            )}
          </section>

          <aside className="space-y-5">
            <div className="dx-card px-4 py-4">
              <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                <Send size={12} aria-hidden="true" />
                Ready to go out
              </p>
              {entries.filter((entry) => entry.status === 'draft').length === 0 ? (
                <p className="text-[0.8125rem] text-ink-muted">Every draft has been sent on.</p>
              ) : (
                <ul className="space-y-2">
                  {entries
                    .filter((entry) => entry.status === 'draft')
                    .slice(0, 4)
                    .map((entry) => (
                      <li key={entry.id} className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openEntry(entry.id)}
                          className="min-w-0 flex-1 text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-[180ms] hover:text-brand-700"
                        >
                          {entry.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => sendForReview(entry)}
                          className="shrink-0 rounded-sm px-2 py-0.5 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:bg-brand-50"
                        >
                          Send
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="dx-card px-4 py-4">
              <p className="dx-eyebrow mb-2">Why this is one place</p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                The fire drill notice is written once. It paints the lobby wall, sits under the
                greeting on the home page, and answers anyone who types {'“'}evacuation
                {'”'} into the help desk. Change a word and all three change together.
              </p>
              <p className="mt-2.5 text-[0.75rem] text-ink-subtle">
                {entries.filter(showing).length} entries published · {screensCarrying} screens
                reading them.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {open !== null && (
        <EntryDialog
          key={open.id}
          entry={open}
          openLocale={openLocale}
          onClose={() => setOpenId(null)}
          onSave={(edit) => save(open, edit)}
          onSurfaces={(surfaces) => setSurfaces(open, surfaces)}
          onRestore={(version) => restore(open, version)}
          onTranslate={(locale, title, body) => translate(open, locale, title, body)}
        />
      )}

      {writing && <NewEntryDialog onClose={() => setWriting(false)} onCreate={create} />}
    </div>
  );
}
