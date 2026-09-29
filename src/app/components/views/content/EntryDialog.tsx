import { useState } from 'react';
import type { FormEvent } from 'react';
import { History, Languages, PenLine, RotateCcw, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { timeAgo } from '../../../lib/format';
import { SurfacePreview } from './SurfacePreview';
import {
  LOCALES,
  SURFACES,
  kindLabel,
  localeState,
  statusOf,
  translationOf,
  unchanged,
} from './library';
import type { Edit } from './library';
import type { Entry, EntryLocale, EntrySurface } from '../../../lib/data';

const TABS = [
  { id: 'write', label: 'Write', icon: PenLine },
  { id: 'versions', label: 'Versions', icon: History },
  { id: 'languages', label: 'Languages', icon: Languages },
] as const;

const STATE_TONE: Record<string, string> = {
  ready: 'bg-success/12 text-success',
  stale: 'bg-warning/12 text-warning',
  missing: 'bg-nt-100 text-ink-subtle',
};

const STATE_WORD: Record<string, string> = {
  ready: 'Up to date',
  stale: 'Out of date',
  missing: 'Not translated',
};

interface EntryDialogProps {
  entry: Entry;
  openLocale?: EntryLocale;
  onClose: () => void;
  onSave: (edit: Edit) => void;
  onSurfaces: (surfaces: EntrySurface[]) => void;
  onRestore: (version: number) => void;
  onTranslate: (locale: EntryLocale, title: string, body: string) => void;
}

export function EntryDialog({
  entry,
  openLocale,
  onClose,
  onSave,
  onSurfaces,
  onRestore,
  onTranslate,
}: EntryDialogProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>(
    openLocale === undefined ? 'write' : 'languages',
  );
  const [edit, setEdit] = useState<Edit>({
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    note: '',
  });
  const [errors, setErrors] = useState<{ title?: string; body?: string; note?: string }>({});
  const [translating, setTranslating] = useState<EntryLocale | null>(openLocale ?? null);
  const [draftTitle, setDraftTitle] = useState(
    openLocale === undefined ? '' : (translationOf(entry, openLocale)?.title ?? ''),
  );
  const [draftBody, setDraftBody] = useState(
    openLocale === undefined ? '' : (translationOf(entry, openLocale)?.body ?? ''),
  );

  const set = <K extends keyof Edit>(key: K, value: Edit[K]) =>
    setEdit((current) => ({ ...current, [key]: value }));

  const status = statusOf(entry.status);
  const preview: Entry = { ...entry, title: edit.title, summary: edit.summary, body: edit.body };
  const untouched = unchanged(entry, edit);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: typeof errors = {};
    if (edit.title.trim().length < 4) found.title = 'A title people can scan in a list.';
    if (edit.body.trim().length < 12) found.body = 'Say the whole thing — screens get one shot.';
    if (!untouched && edit.note.trim().length < 4)
      found.note = 'One line on what changed, for whoever reads this in six months.';

    setErrors(found);
    const firstBad = (['title', 'body', 'note'] as const).find((key) => found[key] !== undefined);
    if (firstBad !== undefined) {
      setTab('write');
      document.getElementById(`entry-${firstBad}`)?.focus();
      return;
    }

    onSave({
      title: edit.title.trim(),
      summary: edit.summary.trim(),
      body: edit.body.trim(),
      note: edit.note.trim(),
    });
  };

  const openTranslation = (locale: EntryLocale) => {
    const existing = translationOf(entry, locale);
    setDraftTitle(existing?.title ?? '');
    setDraftBody(existing?.body ?? '');
    setTranslating(locale);
  };

  const toggleSurface = (surface: EntrySurface) =>
    onSurfaces(
      entry.surfaces.includes(surface)
        ? entry.surfaces.filter((row) => row !== surface)
        : [...entry.surfaces, surface],
    );

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <p className="dx-eyebrow mb-1.5 flex flex-wrap items-center gap-2">
              {kindLabel(entry.kind)}
              <span className={cn('rounded-full px-2 py-0.5 font-medium', status.tone)}>
                {status.label}
              </span>
              <span className="text-ink-subtle">
                v{entry.version} · {entry.owner}
              </span>
            </p>
            <h2 className="dx-h3 truncate">{entry.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-sm p-1.5 text-ink-muted transition-colors duration-[180ms] hover:bg-nt-50 hover:text-ink"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 px-6 py-5">
            <div role="tablist" aria-label="What to edit" className="mb-5 flex gap-1 rounded-lg bg-nt-50 p-1">
              {TABS.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === row.id}
                  onClick={() => setTab(row.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    tab === row.id
                      ? 'bg-nt-0 font-medium text-ink shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <row.icon size={13} aria-hidden="true" />
                  {row.label}
                </button>
              ))}
            </div>

            {tab === 'write' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="entry-title" className="dx-eyebrow mb-1.5 block">
                    Title
                  </label>
                  <input
                    id="entry-title"
                    type="text"
                    value={edit.title}
                    maxLength={70}
                    onChange={(event) => set('title', event.target.value)}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'entry-title-error' : undefined}
                    className={cn('dx-field', errors.title && 'border-danger')}
                  />
                  {errors.title && (
                    <p id="entry-title-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="entry-summary" className="dx-eyebrow mb-1.5 block">
                    Why it exists
                  </label>
                  <input
                    id="entry-summary"
                    type="text"
                    value={edit.summary}
                    maxLength={90}
                    onChange={(event) => set('summary', event.target.value)}
                    placeholder="A line for whoever finds this in the library."
                    className="dx-field"
                  />
                </div>

                <div>
                  <label htmlFor="entry-body" className="dx-eyebrow mb-1.5 block">
                    The words themselves
                  </label>
                  <textarea
                    id="entry-body"
                    value={edit.body}
                    rows={4}
                    maxLength={280}
                    onChange={(event) => set('body', event.target.value)}
                    aria-invalid={Boolean(errors.body)}
                    aria-describedby={errors.body ? 'entry-body-error' : undefined}
                    className={cn('dx-field resize-none', errors.body && 'border-danger')}
                  />
                  <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
                    {edit.body.length} of 280. Everything below updates as you type.
                  </p>
                  {errors.body && (
                    <p id="entry-body-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                      {errors.body}
                    </p>
                  )}
                </div>

                <div>
                  <p className="dx-eyebrow mb-2">Where it may appear</p>
                  <div className="space-y-2">
                    {SURFACES.map((surface) => {
                      const on = entry.surfaces.includes(surface.id);

                      return (
                        <button
                          key={surface.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleSurface(surface.id)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-sm border px-3.5 py-2.5 text-left transition-colors duration-[180ms]',
                            on
                              ? 'border-brand-300 bg-brand-50/60'
                              : 'border-line bg-nt-0 hover:border-brand-200',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[0.1875rem] border',
                              on ? 'border-brand-600 bg-brand-600' : 'border-line-strong',
                            )}
                            aria-hidden="true"
                          />
                          <span className="min-w-0">
                            <span className="block text-[0.8125rem] font-medium text-ink">
                              {surface.product} · {surface.name}
                            </span>
                            <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-muted">
                              {surface.blurb}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="entry-note" className="dx-eyebrow mb-1.5 block">
                    What changed
                  </label>
                  <input
                    id="entry-note"
                    type="text"
                    value={edit.note}
                    maxLength={90}
                    disabled={untouched}
                    onChange={(event) => set('note', event.target.value)}
                    aria-invalid={Boolean(errors.note)}
                    aria-describedby={errors.note ? 'entry-note-error' : undefined}
                    placeholder={untouched ? 'Nothing yet' : 'Added the stair instruction'}
                    className={cn('dx-field', errors.note && 'border-danger')}
                  />
                  {errors.note && (
                    <p id="entry-note-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                      {errors.note}
                    </p>
                  )}
                </div>
              </div>
            )}

            {tab === 'versions' && (
              <div>
                <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">
                  Every save keeps the words it replaced. Restoring one writes a new version rather
                  than erasing the ones after it.
                </p>

                <ol className="space-y-2">
                  <li className="rounded-sm border border-brand-300 bg-brand-50/50 px-3.5 py-3">
                    <p className="flex items-center justify-between gap-3 text-[0.75rem] text-brand-700">
                      <span className="font-medium">Version {entry.version} · showing now</span>
                      <span>{timeAgo(entry.updatedAt)}</span>
                    </p>
                    <p className="mt-1.5 text-[0.8125rem] font-medium text-ink">{entry.title}</p>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">{entry.body}</p>
                  </li>

                  {[...entry.history].reverse().map((revision) => (
                    <li
                      key={revision.version}
                      className="rounded-sm border border-line bg-nt-0 px-3.5 py-3"
                    >
                      <p className="flex items-center justify-between gap-3 text-[0.75rem] text-ink-muted">
                        <span className="font-medium text-ink">Version {revision.version}</span>
                        <span>
                          {revision.savedBy} · {timeAgo(revision.savedAt)}
                        </span>
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] font-medium text-ink">{revision.title}</p>
                      <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">
                        {revision.body}
                      </p>
                      <p className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[0.75rem] italic text-ink-subtle">
                          {revision.note}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRestore(revision.version)}
                          className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:bg-brand-50"
                        >
                          <RotateCcw size={12} aria-hidden="true" />
                          Bring this back
                        </button>
                      </p>
                    </li>
                  ))}

                  {entry.history.length === 0 && (
                    <li className="rounded-sm border border-dashed border-line px-3.5 py-4 text-[0.8125rem] text-ink-muted">
                      Nothing has replaced these words yet.
                    </li>
                  )}
                </ol>
              </div>
            )}

            {tab === 'languages' && (
              <div className="space-y-3">
                <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                  A translation is tied to the version it was made from. Change the English and the
                  others say so, rather than quietly showing last month{'’'}s wording.
                </p>

                {LOCALES.map((locale) => {
                  const state = localeState(entry, locale.id);
                  const translation = translationOf(entry, locale.id);
                  const open = translating === locale.id;

                  return (
                    <div key={locale.id} className="rounded-sm border border-line bg-nt-0 px-3.5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.8125rem] font-medium text-ink">
                          {locale.name}{' '}
                          <span className="font-normal text-ink-subtle">{locale.endonym}</span>
                        </p>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                            STATE_TONE[state],
                          )}
                        >
                          {STATE_WORD[state]}
                        </span>
                      </div>

                      {translation !== undefined && !open && (
                        <div dir={locale.rtl ? 'rtl' : 'ltr'} className="mt-2">
                          <p className="text-[0.8125rem] font-medium text-ink">{translation.title}</p>
                          <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">
                            {translation.body}
                          </p>
                        </div>
                      )}

                      {translation !== undefined && !open && (
                        <p className="mt-2 text-[0.75rem] text-ink-subtle">
                          From version {translation.fromVersion} by {translation.by} ·{' '}
                          {timeAgo(translation.updatedAt)}
                        </p>
                      )}

                      {open ? (
                        <div className="mt-2.5 space-y-2">
                          <input
                            type="text"
                            value={draftTitle}
                            dir={locale.rtl ? 'rtl' : 'ltr'}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            placeholder={`${locale.name} title`}
                            className="dx-field"
                          />
                          <textarea
                            value={draftBody}
                            rows={3}
                            dir={locale.rtl ? 'rtl' : 'ltr'}
                            onChange={(event) => setDraftBody(event.target.value)}
                            placeholder={`${locale.name} wording`}
                            className="dx-field resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onTranslate(locale.id, draftTitle.trim(), draftBody.trim());
                                setTranslating(null);
                              }}
                              disabled={draftTitle.trim() === '' || draftBody.trim() === ''}
                              className="dx-btn-primary h-8 px-3 text-[0.75rem] disabled:opacity-50"
                            >
                              Mark as current
                            </button>
                            <button
                              type="button"
                              onClick={() => setTranslating(null)}
                              className="dx-btn-secondary h-8 px-3 text-[0.75rem]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openTranslation(locale.id)}
                          className="mt-2 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
                        >
                          {state === 'missing' ? 'Add the translation' : 'Bring it up to date'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="border-t border-line bg-nt-50 px-5 py-5 lg:border-l lg:border-t-0">
            <p className="dx-eyebrow mb-1">Where it lands</p>
            <p className="mb-3.5 text-[0.75rem] leading-relaxed text-ink-muted">
              The same words, in the chrome each product gives them.
            </p>

            {entry.surfaces.length === 0 ? (
              <p className="rounded-sm border border-dashed border-line px-3.5 py-4 text-[0.8125rem] text-ink-muted">
                Nowhere yet. Tick a surface and it appears here.
              </p>
            ) : (
              <div className="space-y-3">
                {SURFACES.filter((surface) => entry.surfaces.includes(surface.id)).map(
                  (surface) => (
                    <div key={surface.id}>
                      <p className="mb-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-subtle">
                        {surface.product}
                      </p>
                      <SurfacePreview entry={preview} surface={surface.id} />
                    </div>
                  ),
                )}
              </div>
            )}
          </aside>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3.5">
          <p className="text-[0.75rem] text-ink-muted">
            {untouched ? 'No changes yet' : `Saving makes this version ${entry.version + 1}`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Close
            </button>
            <button type="submit" disabled={untouched} className="dx-btn-primary disabled:opacity-50">
              Save a new version
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
