import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Zap } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { ScreenCanvas } from './ScreenCanvas';
import { isLiveSource, paint, sourceName } from './paint';
import type { Board } from './paint';
import { weight } from '../../../lib/format';
import { usable } from '../../../lib/rights';
import type { Canvas, CanvasSource, CanvasTone } from '../../../lib/data';

export interface CanvasDraft {
  title: string;
  source: CanvasSource;
  tone: CanvasTone;
  seconds: number;
  headline: string;
  body: string;
  footnote: string;
  entryId?: string;
  assetId?: string;
}

export const blankCanvas = (): CanvasDraft => ({
  title: '',
  source: 'notice',
  tone: 'brand',
  seconds: 8,
  headline: '',
  body: '',
  footnote: '',
});

export const draftFromCanvas = (canvas: Canvas): CanvasDraft => ({
  title: canvas.title,
  source: canvas.source,
  tone: canvas.tone,
  seconds: canvas.seconds,
  headline: canvas.headline ?? '',
  body: canvas.body ?? '',
  footnote: canvas.footnote ?? '',
  entryId: canvas.entryId,
  assetId: canvas.assetId,
});

const SOURCES: CanvasSource[] = [
  'notice',
  'poster',
  'arrivals',
  'events',
  'menu',
  'rooms',
  'comfort',
  'wayfinding',
];

const TONES: Array<{ id: CanvasTone; label: string; swatch: string }> = [
  { id: 'brand', label: 'Brand', swatch: 'bg-brand-700' },
  { id: 'ink', label: 'Ink', swatch: 'bg-nt-900' },
  { id: 'green', label: 'Green', swatch: 'bg-grn-700' },
  { id: 'warm', label: 'Warning', swatch: 'bg-warning' },
];

const WHERE_FROM: Record<CanvasSource, string> = {
  notice: 'You write this one by hand.',
  poster: 'Shows a picture straight out of Vault, and stops showing it the day the licence runs out.',
  arrivals: 'Reads today’s visitor list straight out of VisitFlow.',
  events: 'Reads the next published event out of Gather.',
  menu: 'Reads what the café is still serving out of Nourish.',
  rooms: 'Reads live bookings out of SpaceOS — a door panel shows its own room.',
  comfort: 'Reads temperature and CO₂ for this floor out of Atmosphere.',
  wayfinding: 'Reads whatever Pathfinder is routing around right now.',
};

interface Errors {
  title?: string;
  headline?: string;
  assetId?: string;
}

interface CanvasDialogProps {
  initial: CanvasDraft;
  editingId?: string;
  board: Board;
  onClose: () => void;
  onSave: (draft: CanvasDraft) => void;
}

export function CanvasDialog({ initial, editingId, board, onClose, onSave }: CanvasDialogProps) {
  const [draft, setDraft] = useState<CanvasDraft>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof CanvasDraft>(key: K, value: CanvasDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const live = isLiveSource(draft.source);
  const entry = board.entries.find((row) => row.id === draft.entryId);
  const bound = draft.source === 'notice' && entry !== undefined;
  const showsPicture = draft.source === 'poster';
  const artwork = board.assets.filter(usable);
  const picked = board.assets.find((row) => row.id === draft.assetId);

  const preview = paint(
    {
      id: editingId ?? 'preview',
      createdAt: '',
      updatedAt: '',
      title: draft.title || 'Untitled canvas',
      source: draft.source,
      tone: draft.tone,
      seconds: draft.seconds,
      updatedBy: '',
      headline: draft.headline || draft.title || 'Your headline here',
      body: draft.body || undefined,
      footnote: draft.footnote || undefined,
      entryId: draft.entryId,
      assetId: draft.assetId,
    },
    board,
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.title.trim().length < 3) found.title = 'Give it a name you will recognise in a list.';
    if (showsPicture && draft.assetId === undefined) found.assetId = 'Pick the artwork this plays.';
    if (!live && !bound && !showsPicture && draft.headline.trim().length < 3)
      found.headline = 'A notice needs something to say.';

    setErrors(found);
    if (found.title) {
      document.getElementById('canvas-title')?.focus();
      return;
    }
    if (found.assetId) {
      document.getElementById('canvas-artwork')?.focus();
      return;
    }
    if (found.headline) {
      document.getElementById('canvas-headline')?.focus();
      return;
    }

    onSave({
      ...draft,
      title: draft.title.trim(),
      headline: draft.headline.trim(),
      body: draft.body.trim(),
      footnote: draft.footnote.trim(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">LiveCanvas</p>
            <h2 className="dx-h4">{editingId ? 'Edit this canvas' : 'New canvas'}</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              A canvas is one thing a screen says. Point it at another product and it keeps itself
              current.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="dx-btn-ghost -mr-2 -mt-1 shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-[1fr_15rem]">
            <div className="space-y-5">
              <div>
                <label htmlFor="canvas-title" className="dx-eyebrow mb-1.5 block">
                  Name it
                </label>
                <input
                  id="canvas-title"
                  type="text"
                  value={draft.title}
                  data-autofocus
                  maxLength={48}
                  onChange={(event) => set('title', event.target.value)}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'canvas-title-error' : undefined}
                  placeholder="Parking is full on Thursday"
                  className={cn('dx-field', errors.title && 'border-danger')}
                />
                {errors.title && (
                  <p id="canvas-title-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="canvas-source" className="dx-eyebrow mb-1.5 block">
                  Where the words come from
                </label>
                <select
                  id="canvas-source"
                  value={draft.source}
                  onChange={(event) => set('source', event.target.value as CanvasSource)}
                  className="dx-field"
                >
                  {SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {sourceName(source)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] leading-relaxed text-ink-muted">
                  {live && <Zap size={12} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />}
                  {bound ? 'Bound to an entry in Content, so the words follow whatever is published there.' : WHERE_FROM[draft.source]}
                </p>
              </div>

              {bound && entry !== undefined && (
                <div className="rounded-sm border border-brand-200 bg-brand-50/50 px-3.5 py-3">
                  <p className="dx-eyebrow mb-1.5 flex items-center gap-1.5 text-brand-700">
                    <Zap size={11} aria-hidden="true" />
                    Written in Content
                  </p>
                  <p className="text-[0.8125rem] font-medium leading-tight text-ink">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">{entry.body}</p>
                  <p className="mt-2 text-[0.75rem] text-ink-subtle">
                    Version {entry.version} by {entry.owner}. Edit it in Content and this screen
                    changes with it.
                  </p>
                </div>
              )}

              {showsPicture && (
                <div>
                  <label htmlFor="canvas-artwork" className="dx-eyebrow mb-1.5 block">
                    The artwork
                  </label>
                  <select
                    id="canvas-artwork"
                    value={draft.assetId ?? ''}
                    onChange={(event) =>
                      set('assetId', event.target.value === '' ? undefined : event.target.value)
                    }
                    aria-invalid={Boolean(errors.assetId)}
                    aria-describedby={errors.assetId ? 'canvas-artwork-error' : undefined}
                    className={cn('dx-field', errors.assetId && 'border-danger')}
                  >
                    <option value="">Pick something from Vault</option>
                    {artwork.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                  {errors.assetId && (
                    <p
                      id="canvas-artwork-error"
                      role="alert"
                      className="mt-1.5 text-[0.75rem] text-danger"
                    >
                      {errors.assetId}
                    </p>
                  )}
                  {picked !== undefined && (
                    <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-subtle">
                      {picked.format} · {weight(picked.bytes)}
                      {picked.credit === undefined ? '' : ` · ${picked.credit}`}
                    </p>
                  )}
                  <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-muted">
                    Only files signed off and in date are offered here.
                  </p>
                </div>
              )}

              {showsPicture && (
                <div>
                  <label htmlFor="canvas-caption" className="dx-eyebrow mb-1.5 block">
                    Caption over the picture
                  </label>
                  <input
                    id="canvas-caption"
                    type="text"
                    value={draft.headline}
                    maxLength={40}
                    onChange={(event) => set('headline', event.target.value)}
                    placeholder="Riyadh Summit"
                    className="dx-field"
                  />
                </div>
              )}

              {!live && !bound && !showsPicture && (
                <>
                  <div>
                    <label htmlFor="canvas-headline" className="dx-eyebrow mb-1.5 block">
                      Headline
                    </label>
                    <input
                      id="canvas-headline"
                      type="text"
                      value={draft.headline}
                      maxLength={60}
                      onChange={(event) => set('headline', event.target.value)}
                      aria-invalid={Boolean(errors.headline)}
                      aria-describedby={errors.headline ? 'canvas-headline-error' : undefined}
                      placeholder="Visitor parking is full on Thursday"
                      className={cn('dx-field', errors.headline && 'border-danger')}
                    />
                    {errors.headline && (
                      <p
                        id="canvas-headline-error"
                        role="alert"
                        className="mt-1.5 text-[0.75rem] text-danger"
                      >
                        {errors.headline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="canvas-body" className="dx-eyebrow mb-1.5 block">
                      The detail
                    </label>
                    <textarea
                      id="canvas-body"
                      value={draft.body}
                      rows={3}
                      maxLength={180}
                      onChange={(event) => set('body', event.target.value)}
                      placeholder="Use the street bays on the north side, or come by the metro."
                      className="dx-field resize-none"
                    />
                  </div>
                </>
              )}

              {!live && (
                <div>
                  <label htmlFor="canvas-footnote" className="dx-eyebrow mb-1.5 block">
                    Small print
                  </label>
                  <input
                    id="canvas-footnote"
                    type="text"
                    value={draft.footnote}
                    maxLength={80}
                    onChange={(event) => set('footnote', event.target.value)}
                    placeholder="Ask reception if you are stuck."
                    className="dx-field"
                  />
                </div>
              )}

              <div>
                <p className="dx-eyebrow mb-1.5">Colour</p>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      aria-pressed={draft.tone === tone.id}
                      onClick={() => set('tone', tone.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors duration-[180ms]',
                        draft.tone === tone.id
                          ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'border-line text-ink-muted hover:text-ink',
                      )}
                    >
                      <span
                        className={cn('h-3 w-3 rounded-full', tone.swatch)}
                        aria-hidden="true"
                      />
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="canvas-seconds"
                  className="mb-1.5 flex items-center justify-between text-[0.75rem] text-ink-muted"
                >
                  <span className="dx-eyebrow">How long it holds</span>
                  <span className="font-medium text-ink">{draft.seconds}s</span>
                </label>
                <input
                  id="canvas-seconds"
                  type="range"
                  min={4}
                  max={30}
                  step={2}
                  value={draft.seconds}
                  onChange={(event) => set('seconds', Number(event.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>

            <div>
              <p className="dx-eyebrow mb-2">How it will look</p>
              <ScreenCanvas frame={preview} shape="landscape" size="stage" />
              <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-muted">
                Rendered against today’s real data, exactly as the screens will draw it.
              </p>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line bg-nt-50 px-6 py-4">
          <button type="button" onClick={onClose} className="dx-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="dx-btn-primary">
            {editingId ? 'Save it' : 'Add to the library'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
