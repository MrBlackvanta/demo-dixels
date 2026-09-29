import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { SurfacePreview } from './SurfacePreview';
import { KINDS, SURFACES } from './library';
import type { Entry, EntryKind, EntrySurface } from '../../../lib/data';

export interface NewEntry {
  title: string;
  kind: EntryKind;
  summary: string;
  body: string;
  surfaces: EntrySurface[];
}

const slugOf = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

interface NewEntryDialogProps {
  onClose: () => void;
  onCreate: (draft: NewEntry) => void;
}

export function NewEntryDialog({ onClose, onCreate }: NewEntryDialogProps) {
  const [draft, setDraft] = useState<NewEntry>({
    title: '',
    kind: 'notice',
    summary: '',
    body: '',
    surfaces: ['today'],
  });
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const set = <K extends keyof NewEntry>(key: K, value: NewEntry[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const preview: Entry = {
    id: 'preview',
    createdAt: '',
    updatedAt: '',
    title: draft.title || 'Your title here',
    slug: slugOf(draft.title),
    kind: draft.kind,
    status: 'draft',
    summary: draft.summary,
    body: draft.body || 'The words people will actually read, wherever this ends up.',
    owner: '',
    surfaces: draft.surfaces,
    keywords: [],
    version: 1,
    history: [],
    translations: [],
    reads: 0,
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: typeof errors = {};
    if (draft.title.trim().length < 4) found.title = 'A title people can scan in a list.';
    if (draft.body.trim().length < 12) found.body = 'Say the whole thing — screens get one shot.';

    setErrors(found);
    if (found.title) {
      document.getElementById('new-entry-title')?.focus();
      return;
    }
    if (found.body) {
      document.getElementById('new-entry-body')?.focus();
      return;
    }

    onCreate({
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      body: draft.body.trim(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <p className="dx-eyebrow mb-1.5">Write something new</p>
            <h2 className="dx-h3">One entry, wherever it needs to be</h2>
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

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_18rem]">
          <div className="space-y-4 px-6 py-5">
            <div>
              <p className="dx-eyebrow mb-2">What kind of thing is it</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {KINDS.map((kind) => (
                  <button
                    key={kind.id}
                    type="button"
                    aria-pressed={draft.kind === kind.id}
                    onClick={() => set('kind', kind.id)}
                    className={cn(
                      'rounded-sm border px-3 py-2.5 text-left transition-colors duration-[180ms]',
                      draft.kind === kind.id
                        ? 'border-brand-300 bg-brand-50/60'
                        : 'border-line bg-nt-0 hover:border-brand-200',
                    )}
                  >
                    <span className="block text-[0.8125rem] font-medium text-ink">
                      {kind.label}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-muted">
                      {kind.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="new-entry-title" className="dx-eyebrow mb-1.5 block">
                Title
              </label>
              <input
                id="new-entry-title"
                type="text"
                value={draft.title}
                maxLength={70}
                onChange={(event) => set('title', event.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'new-entry-title-error' : undefined}
                placeholder="The east stair is closed until Thursday"
                className={cn('dx-field', errors.title && 'border-danger')}
              />
              {errors.title && (
                <p id="new-entry-title-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.title}
                </p>
              )}
              {draft.title.trim() !== '' && (
                <p className="mt-1.5 text-[0.75rem] text-ink-subtle">/{slugOf(draft.title)}</p>
              )}
            </div>

            <div>
              <label htmlFor="new-entry-summary" className="dx-eyebrow mb-1.5 block">
                Why it exists
              </label>
              <input
                id="new-entry-summary"
                type="text"
                value={draft.summary}
                maxLength={90}
                onChange={(event) => set('summary', event.target.value)}
                placeholder="A line for whoever finds this in the library."
                className="dx-field"
              />
            </div>

            <div>
              <label htmlFor="new-entry-body" className="dx-eyebrow mb-1.5 block">
                The words themselves
              </label>
              <textarea
                id="new-entry-body"
                value={draft.body}
                rows={4}
                maxLength={280}
                onChange={(event) => set('body', event.target.value)}
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? 'new-entry-body-error' : undefined}
                placeholder="Use the west core instead. The lifts are unaffected."
                className={cn('dx-field resize-none', errors.body && 'border-danger')}
              />
              {errors.body && (
                <p id="new-entry-body-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.body}
                </p>
              )}
            </div>

            <div>
              <p className="dx-eyebrow mb-2">Where it may appear</p>
              <div className="flex flex-wrap gap-2">
                {SURFACES.map((surface) => {
                  const on = draft.surfaces.includes(surface.id);

                  return (
                    <button
                      key={surface.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set(
                          'surfaces',
                          on
                            ? draft.surfaces.filter((row) => row !== surface.id)
                            : [...draft.surfaces, surface.id],
                        )
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors duration-[180ms]',
                        on
                          ? 'border-brand-300 bg-brand-50 text-brand-700'
                          : 'border-line text-ink-muted hover:border-brand-200',
                      )}
                    >
                      {surface.product}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="border-t border-line bg-nt-50 px-5 py-5 lg:border-l lg:border-t-0">
            <p className="dx-eyebrow mb-3">While you type</p>
            {draft.surfaces.length === 0 ? (
              <p className="rounded-sm border border-dashed border-line px-3.5 py-4 text-[0.8125rem] text-ink-muted">
                Pick a surface to see it.
              </p>
            ) : (
              <div className="space-y-3">
                {SURFACES.filter((surface) => draft.surfaces.includes(surface.id)).map(
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
          <p className="text-[0.75rem] text-ink-muted">Saved as a draft — nothing goes live yet.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dx-btn-primary">
              Create the entry
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
