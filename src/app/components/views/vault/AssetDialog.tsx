import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  AlertTriangle,
  Download,
  History,
  Info,
  MonitorPlay,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { timeAgo } from '../../../lib/format';
import { AssetThumb } from './AssetThumb';
import { readFile } from './intake';
import {
  LICENCES,
  editFrom,
  expired,
  expiryLabel,
  inUse,
  licenceOf,
  runtime,
  shape,
  statusOf,
  unchanged,
  usable,
  usageLabel,
  weight,
} from './assets';
import type { Edit, Usage } from './assets';
import type { Asset, AssetLicence, Shelf } from '../../../lib/data';

const TABS = [
  { id: 'about', label: 'About', icon: Info },
  { id: 'rights', label: 'Rights', icon: ShieldCheck },
  { id: 'showing', label: 'Where it shows', icon: MonitorPlay },
  { id: 'versions', label: 'Versions', icon: History },
] as const;

type Tab = (typeof TABS)[number]['id'];

interface AssetDialogProps {
  asset: Asset;
  usage: Usage;
  shelves: Shelf[];
  onClose: () => void;
  onSave: (edit: Edit) => void;
  onApprove: () => void;
  onSendBack: (note: string) => void;
  onReplace: (url: string, bytes: number, note: string) => void;
  onRestore: (version: number) => void;
  onRenew: () => void;
  onDownload: () => void;
  onRetire: () => void;
}

export function AssetDialog({
  asset,
  usage,
  shelves,
  onClose,
  onSave,
  onApprove,
  onSendBack,
  onReplace,
  onRestore,
  onRenew,
  onDownload,
  onRetire,
}: AssetDialogProps) {
  const input = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('about');
  const [edit, setEdit] = useState<Edit>(editFrom(asset));
  const [note, setNote] = useState('');
  const [reading, setReading] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  const set = <K extends keyof Edit>(key: K, value: Edit[K]) =>
    setEdit((current) => ({ ...current, [key]: value }));

  const status = statusOf(asset.status);
  const gone = expired(asset);
  const live = usable(asset);
  const held = inUse(usage);
  const dirty = !unchanged(asset, edit);

  const swap = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file === undefined) return;

    setProblem(null);
    setReading(1);
    readFile(file, setReading)
      .then(({ taken, warning }) => {
        onReplace(taken.url, taken.bytes, note.trim() === '' ? `Replaced with ${taken.name}` : note.trim());
        setNote('');
        if (warning !== undefined) setProblem(warning);
      })
      .catch((error: Error) => setProblem(error.message))
      .finally(() => setReading(0));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave(edit);
  };

  return (
    <Modal onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line bg-nt-50 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="dx-eyebrow mb-1.5">Vault · {shelves.find((s) => s.id === asset.shelfId)?.name}</p>
            <h2 className="dx-h4 truncate">{asset.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn('rounded-full px-2 py-0.5 text-[0.6875rem] font-medium', status.tone)}
              >
                {status.label}
              </span>
              <span className="text-[0.75rem] text-ink-muted">
                {shape(asset)} · {weight(asset.bytes)}
                {asset.seconds === undefined ? '' : ` · ${runtime(asset.seconds)}`}
              </span>
            </div>
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
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-[16rem_1fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-sm border border-line">
                <AssetThumb asset={asset} ratio="aspect-[4/3]" rounded="rounded-none" />
              </div>

              {gone && (
                <p className="flex items-start gap-2 rounded-sm bg-danger/10 px-3 py-2.5 text-[0.75rem] leading-relaxed text-danger">
                  <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {expiryLabel(asset)}. Nothing will paint it until the date is put right.
                </p>
              )}

              {asset.restriction !== undefined && (
                <p className="rounded-sm bg-warning/10 px-3 py-2.5 text-[0.75rem] leading-relaxed text-ink">
                  {asset.restriction}
                </p>
              )}

              <dl className="space-y-1.5 text-[0.75rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-subtle">Looked after by</dt>
                  <dd className="text-ink">{asset.owner}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-subtle">Downloaded</dt>
                  <dd className="text-ink">{asset.downloads.toLocaleString('en-GB')} times</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-subtle">Last opened</dt>
                  <dd className="text-ink">
                    {asset.openedAt === undefined ? 'Never' : timeAgo(asset.openedAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-subtle">Showing</dt>
                  <dd className={cn(held ? 'text-brand-700' : 'text-ink')}>{usageLabel(usage)}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onDownload} className="dx-btn-secondary flex-1 text-[0.8125rem]">
                  <Download size={13} aria-hidden="true" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="dx-btn-secondary flex-1 text-[0.8125rem]"
                >
                  <Upload size={13} aria-hidden="true" />
                  Replace
                </button>
                <input
                  ref={input}
                  type="file"
                  onChange={swap}
                  className="sr-only"
                  aria-label="Replace this file with a new version"
                />
              </div>

              {reading > 0 && (
                <span className="block h-1 overflow-hidden rounded-full bg-nt-200">
                  <span
                    className="block h-full rounded-full bg-brand-600 transition-[width] duration-200"
                    style={{ width: `${reading}%` }}
                  />
                </span>
              )}

              {problem !== null && (
                <p role="alert" className="text-[0.75rem] text-warning">
                  {problem}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-4 min-w-0 max-w-full overflow-x-auto">
                <div role="tablist" aria-label="What to look at" className="flex w-max gap-1 rounded-lg bg-nt-50 p-1">
                  {TABS.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === row.id}
                      onClick={() => setTab(row.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                        tab === row.id
                          ? 'bg-nt-0 font-medium text-ink shadow-sm'
                          : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      <row.icon size={14} aria-hidden="true" />
                      {row.label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'about' && (
                <div className="space-y-4">
                  <label className="block">
                    <span className="dx-eyebrow mb-1.5 block">File name</span>
                    <input
                      type="text"
                      value={edit.name}
                      data-autofocus
                      maxLength={80}
                      onChange={(event) => set('name', event.target.value)}
                      className="dx-field"
                    />
                  </label>

                  <label className="block">
                    <span className="dx-eyebrow mb-1.5 block">Shelf</span>
                    <select
                      value={edit.shelfId}
                      onChange={(event) => set('shelfId', event.target.value)}
                      className="dx-field"
                    >
                      {shelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="dx-eyebrow mb-1.5 block">Tags</span>
                    <input
                      type="text"
                      value={edit.tags}
                      onChange={(event) => set('tags', event.target.value)}
                      placeholder="lobby, exterior, evening"
                      className="dx-field"
                    />
                    <span className="mt-1.5 block text-[0.75rem] text-ink-subtle">
                      Commas between them. Tags are how anyone else finds this.
                    </span>
                  </label>
                </div>
              )}

              {tab === 'rights' && (
                <div className="space-y-4">
                  <label className="block">
                    <span className="dx-eyebrow mb-1.5 block">Where it came from</span>
                    <select
                      value={edit.licence}
                      onChange={(event) => set('licence', event.target.value as AssetLicence)}
                      className="dx-field"
                    >
                      {LICENCES.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.label}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1.5 block text-[0.75rem] leading-relaxed text-ink-muted">
                      {licenceOf(edit.licence).blurb}
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="dx-eyebrow mb-1.5 block">Runs out</span>
                      <input
                        type="date"
                        value={edit.expiresOn}
                        onChange={(event) => set('expiresOn', event.target.value)}
                        className="dx-field"
                      />
                      <span
                        className={cn(
                          'mt-1.5 block text-[0.75rem]',
                          gone ? 'text-danger' : 'text-ink-subtle',
                        )}
                      >
                        {expiryLabel(asset)}
                      </span>
                    </label>

                    <label className="block">
                      <span className="dx-eyebrow mb-1.5 block">Credit</span>
                      <input
                        type="text"
                        value={edit.credit}
                        maxLength={60}
                        onChange={(event) => set('credit', event.target.value)}
                        placeholder="Agency, licence number, or who signed"
                        className="dx-field"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="dx-eyebrow mb-1.5 block">A note that travels with it</span>
                    <input
                      type="text"
                      value={edit.restriction}
                      maxLength={90}
                      onChange={(event) => set('restriction', event.target.value)}
                      placeholder="Internal screens only. Not licensed for social."
                      className="dx-field"
                    />
                  </label>

                  {asset.expiresOn !== undefined && (
                    <button type="button" onClick={onRenew} className="dx-btn-secondary text-[0.8125rem]">
                      Renew for another year
                    </button>
                  )}
                </div>
              )}

              {tab === 'showing' && (
                <div className="space-y-4">
                  <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                    {held
                      ? 'Everything below reads this file. Replace it and they all change on their next loop.'
                      : 'Nothing is pointed at this file. It costs storage and nobody sees it.'}
                  </p>

                  {usage.boards.length > 0 && (
                    <div>
                      <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                        <MonitorPlay size={12} aria-hidden="true" />
                        Playing as a poster
                      </p>
                      <ul className="space-y-1.5">
                        {usage.boards.map((board) => (
                          <li
                            key={board}
                            className="rounded-sm border border-line px-3 py-2 text-[0.8125rem] text-ink"
                          >
                            {board}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {usage.notices.length > 0 && (
                    <div>
                      <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                        <ScrollText size={12} aria-hidden="true" />
                        Behind the words of
                      </p>
                      <ul className="space-y-1.5">
                        {usage.notices.map((notice) => (
                          <li
                            key={notice}
                            className="rounded-sm border border-line px-3 py-2 text-[0.8125rem] text-ink"
                          >
                            {notice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p
                    className={cn(
                      'rounded-sm px-3.5 py-3 text-[0.8125rem] leading-relaxed',
                      live ? 'bg-nt-50 text-ink' : 'bg-warning/10 text-ink',
                    )}
                  >
                    {live
                      ? usageLabel(usage)
                      : `Held back — ${gone ? 'the licence has run out' : 'nobody has signed it off'}, so every screen pointed at it shows a holding card instead.`}
                  </p>
                </div>
              )}

              {tab === 'versions' && (
                <div className="space-y-2.5">
                  <div className="rounded-sm border border-brand-200 bg-brand-50/50 px-3.5 py-3">
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.8125rem] font-medium text-ink">
                        Version {asset.version}
                      </span>
                      <span className="text-[0.75rem] text-ink-subtle">
                        {timeAgo(asset.updatedAt)}
                      </span>
                    </p>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">
                      {asset.reviewNote ?? 'The file as it stands. This is what every screen reads.'}
                    </p>
                  </div>

                  {[...asset.history].reverse().map((row) => (
                    <div key={row.version} className="rounded-sm border border-line px-3.5 py-3">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="text-[0.8125rem] font-medium text-ink">
                          Version {row.version}
                        </span>
                        <span className="text-[0.75rem] text-ink-subtle">{timeAgo(row.savedAt)}</span>
                      </p>
                      <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-muted">
                        {row.note} · {weight(row.bytes)} · {row.savedBy}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRestore(row.version)}
                        className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:text-brand-800"
                      >
                        <RotateCcw size={12} aria-hidden="true" />
                        Put this one back
                      </button>
                    </div>
                  ))}

                  {asset.history.length === 0 && (
                    <p className="text-[0.8125rem] text-ink-muted">
                      Nothing has replaced this file yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-nt-50 px-6 py-4">
          {asset.status === 'review' ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What needs changing?"
                aria-label="What needs changing"
                className="dx-field h-9 w-48 text-[0.8125rem]"
              />
              <button
                type="button"
                onClick={() => onSendBack(note.trim() === '' ? 'Sent back for another look.' : note.trim())}
                className="dx-btn-ghost"
              >
                Send it back
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRetire}
              disabled={held}
              title={held ? 'It is showing somewhere. Point that at something else first.' : undefined}
              className="dx-btn-ghost disabled:opacity-40"
            >
              Retire it
            </button>
          )}

          <div className="flex items-center gap-2">
            {asset.status === 'review' && (
              <button type="button" onClick={onApprove} className="dx-btn-secondary">
                <ShieldCheck size={14} aria-hidden="true" />
                Sign it off
              </button>
            )}
            <button type="submit" disabled={!dirty} className="dx-btn-primary">
              Save
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
