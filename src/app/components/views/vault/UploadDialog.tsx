import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { LICENCES, weight } from './assets';
import { readFile } from './intake';
import type { Taken } from './intake';
import type { Asset, AssetLicence, Shelf } from '../../../lib/data';

export interface NewAsset extends Taken {
  shelfId: string;
  tags: string[];
  licence: AssetLicence;
  credit: string;
  expiresOn: string;
}

interface UploadDialogProps {
  shelves: Shelf[];
  shelfId: string;
  existing: Asset[];
  onClose: () => void;
  onUpload: (draft: NewAsset) => void;
}

export function UploadDialog({ shelves, shelfId, existing, onClose, onUpload }: UploadDialogProps) {
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Taken | null>(null);
  const [reading, setReading] = useState(0);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [shelf, setShelf] = useState(shelfId === 'all' ? shelves[0]?.id ?? '' : shelfId);
  const [tags, setTags] = useState('');
  const [licence, setLicence] = useState<AssetLicence>('owned');
  const [credit, setCredit] = useState('');
  const [expiresOn, setExpiresOn] = useState('');

  const needsDate = licence === 'stock' || licence === 'pictured';
  const clash = picked !== null && existing.some((asset) => asset.name === picked.name);

  const take = (file: File) => {
    setProblem(null);
    setReading(1);

    readFile(file, setReading)
      .then(({ taken, warning }) => {
        setPicked(taken);
        if (warning !== undefined) setProblem(warning);
      })
      .catch((error: Error) => setProblem(error.message))
      .finally(() => setReading(0));
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file !== undefined) take(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file !== undefined) take(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (picked === null) return;

    onUpload({
      ...picked,
      shelfId: shelf,
      tags: tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
        .slice(0, 10),
      licence,
      credit: credit.trim(),
      expiresOn,
    });
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Vault</p>
            <h2 className="dx-h4">Put something in</h2>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              Anything from this machine. The rights you set here are what stops it appearing
              somewhere it should not.
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
            className={cn(
              'rounded-lg border border-dashed px-5 py-6 text-center transition-colors duration-[180ms]',
              over ? 'border-brand-400 bg-brand-50' : 'border-line bg-nt-50',
            )}
          >
            {picked === null ? (
              <>
                <UploadCloud size={22} aria-hidden="true" className="mx-auto mb-2 text-ink-subtle" />
                <p className="text-[0.875rem] text-ink">Drop a file here</p>
                <p className="mt-1 text-[0.75rem] text-ink-muted">
                  Pictures get a preview made for them on the way in.
                </p>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => input.current?.click()}
                  className="dx-btn-secondary mt-3"
                >
                  Choose a file
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3.5 text-left">
                {picked.url === '' ? (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-sm bg-nt-100 text-[0.6875rem] font-medium tracking-[0.1em] text-ink-muted">
                    {picked.format}
                  </span>
                ) : (
                  <img
                    src={picked.url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-sm object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-medium text-ink">{picked.name}</p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-muted">
                    {picked.format} · {weight(picked.bytes)}
                    {picked.width === undefined ? '' : ` · ${picked.width} × ${picked.height}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="mt-1 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
                  >
                    Pick a different one
                  </button>
                </div>
              </div>
            )}

            {reading > 0 && (
              <span className="mt-3 block h-1 overflow-hidden rounded-full bg-nt-200">
                <span
                  className="block h-full rounded-full bg-brand-600 transition-[width] duration-200"
                  style={{ width: `${reading}%` }}
                />
              </span>
            )}

            <input
              ref={input}
              type="file"
              onChange={onPick}
              className="sr-only"
              aria-label="Choose a file to put in the vault"
            />
          </div>

          {problem !== null && (
            <p role="alert" className="text-[0.75rem] text-warning">
              {problem}
            </p>
          )}

          {clash && (
            <p role="alert" className="text-[0.75rem] text-warning">
              A file called {picked?.name} is already in here. Putting this in makes a second one —
              replace the original from its own panel if that is what you meant.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="dx-eyebrow mb-1.5 block">Which shelf</span>
              <select
                value={shelf}
                onChange={(event) => setShelf(event.target.value)}
                className="dx-field"
              >
                {shelves.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="dx-eyebrow mb-1.5 block">Where it came from</span>
              <select
                value={licence}
                onChange={(event) => setLicence(event.target.value as AssetLicence)}
                className="dx-field"
              >
                {LICENCES.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="-mt-1 text-[0.75rem] leading-relaxed text-ink-muted">
            {LICENCES.find((row) => row.id === licence)?.blurb}
          </p>

          <label className="block">
            <span className="dx-eyebrow mb-1.5 block">Tags</span>
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="lobby, exterior, evening"
              className="dx-field"
            />
            <span className="mt-1.5 block text-[0.75rem] text-ink-subtle">
              Commas between them. This is how anyone else will find it.
            </span>
          </label>

          {needsDate && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="dx-eyebrow mb-1.5 block">
                  {licence === 'pictured' ? 'Release runs out' : 'Licence runs out'}
                </span>
                <input
                  type="date"
                  value={expiresOn}
                  onChange={(event) => setExpiresOn(event.target.value)}
                  className="dx-field"
                />
              </label>

              <label className="block">
                <span className="dx-eyebrow mb-1.5 block">Credit</span>
                <input
                  type="text"
                  value={credit}
                  onChange={(event) => setCredit(event.target.value)}
                  placeholder={licence === 'pictured' ? 'Release on file for four people' : 'Agency and licence number'}
                  className="dx-field"
                />
              </label>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-nt-50 px-6 py-4">
          <p className="text-[0.75rem] text-ink-muted">
            It goes in as a draft until somebody signs it off.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="dx-btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={picked === null} className="dx-btn-primary">
              Put it in
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
