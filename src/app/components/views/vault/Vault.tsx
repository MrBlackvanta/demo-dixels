import { useMemo, useState } from 'react';
import { HardDrive, Images, MonitorPlay, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import {
  CURRENT_USER,
  assets as assetsCol,
  canvases as canvasesCol,
  channels as channelsCol,
  entries as entriesCol,
  screens as screensCol,
  shelves as shelvesCol,
} from '../../../lib/data';
import { longDay, shiftDay, todayKey } from '../../../lib/format';
import type { Asset, Canvas } from '../../../lib/data';
import { AssetCard } from './AssetCard';
import { AssetDialog } from './AssetDialog';
import { DeadWeight } from './DeadWeight';
import { RightsTable } from './RightsTable';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { UploadDialog } from './UploadDialog';
import type { NewAsset } from './UploadDialog';
import { UsagePanel } from './UsagePanel';
import {
  NO_FILTERS,
  byUrgency,
  detailed,
  expired,
  idle,
  inUse,
  match,
  reclaimable,
  replaced,
  runningOut,
  usable,
  usageOf,
  weight,
} from './assets';
import type { Edit, Filters, Wall } from './assets';

const me = CURRENT_USER.name;
const A_YEAR = 365;

export function Vault() {
  const assets = useCollection(assetsCol);
  const shelves = useCollection(shelvesCol);
  const canvases = useCollection(canvasesCol);
  const channels = useCollection(channelsCol);
  const screens = useCollection(screensCol);
  const entries = useCollection(entriesCol);

  const [lens, setLens] = useState('shelves');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const wall: Wall = useMemo(
    () => ({ canvases, channels, screens, entries }),
    [canvases, channels, screens, entries],
  );

  const open = assets.find((asset) => asset.id === openId) ?? null;

  const waiting = useMemo(
    () => assets.filter((asset) => asset.status === 'review'),
    [assets],
  );

  const shown = useMemo(
    () => assets.filter((asset) => match(asset, filters)).sort(byUrgency),
    [assets, filters],
  );

  const onScreens = useMemo(() => {
    const ids = new Set<string>();
    assets.forEach((asset) => {
      if (usageOf(asset, wall).screens > 0) ids.add(asset.id);
    });
    return ids.size;
  }, [assets, wall]);

  const lapsing = useMemo(
    () => assets.filter((asset) => asset.status !== 'retired' && (expired(asset) || runningOut(asset))),
    [assets],
  );

  const unused = useMemo(
    () => assets.filter((asset) => idle(asset, usageOf(asset, wall))),
    [assets, wall],
  );

  const held = assets.reduce((sum, asset) => sum + asset.bytes, 0);

  const stats = [
    { label: 'Files on a screen right now', value: onScreens, tone: 'neutral' as const },
    { label: 'Waiting on a brand check', value: waiting.length, tone: 'brand' as const },
    { label: 'Licences run out or running out', value: lapsing.length, tone: 'warning' as const },
    { label: 'Nothing is pointed at them', value: unused.length, tone: 'neutral' as const },
  ];

  const lenses: Lens[] = [
    { id: 'shelves', label: 'Shelves', icon: Images, count: assets.length },
    { id: 'usage', label: 'Where it shows', icon: MonitorPlay },
    { id: 'rights', label: 'Rights', icon: ShieldCheck, count: lapsing.length },
    { id: 'dead', label: 'Dead weight', icon: Trash2, count: unused.length },
  ];

  const reachToast = (asset: Asset, changed: string) => {
    const usage = usageOf(asset, wall);
    toast.success(changed, {
      description:
        usage.screens > 0
          ? `${usage.screens} screens pick it up on their next loop.`
          : 'Nothing is pointed at it yet, so nothing changes out there.',
    });
  };

  const save = (asset: Asset, edit: Edit) => {
    assetsCol.update(asset.id, detailed(edit));
    reachToast(asset, `${edit.name.trim()} saved`);
  };

  const approve = (asset: Asset) => {
    assetsCol.update(asset.id, { status: 'approved', reviewer: undefined });
    const usage = usageOf({ ...asset, status: 'approved' }, wall);
    toast.success(`${asset.name} is signed off`, {
      description:
        usage.screens > 0
          ? `It starts painting ${usage.screens} screens on the next loop.`
          : 'Point a poster at it to put it on a screen.',
    });
  };

  const sendBack = (asset: Asset, note: string) => {
    assetsCol.update(asset.id, { status: 'draft', reviewer: undefined, reviewNote: note });
    toast(`Back to ${asset.owner}`, { description: note });
  };

  const replace = (asset: Asset, url: string, bytes: number, note: string) => {
    assetsCol.update(asset.id, replaced(asset, url, bytes, note));
    reachToast(asset, `Version ${asset.version + 1} of ${asset.name}`);
  };

  const restore = (asset: Asset, version: number) => {
    const past = asset.history.find((row) => row.version === version);
    if (past === undefined) return;

    assetsCol.update(
      asset.id,
      replaced(asset, past.url, past.bytes, `Brought version ${version} back`),
    );
    toast.success(`Version ${version} is the file again`, {
      description: `Kept as version ${asset.version + 1} — nothing in between was thrown away.`,
    });
  };

  const renew = (asset: Asset) => {
    const from = expired(asset) ? todayKey() : asset.expiresOn ?? todayKey();
    const until = shiftDay(from, A_YEAR);
    assetsCol.update(asset.id, { expiresOn: until });

    const usage = usageOf({ ...asset, expiresOn: until }, wall);
    toast.success(`${asset.name} is good until ${longDay(until)}`, {
      description:
        expired(asset) && usage.screens > 0
          ? `${usage.screens} screens can show it again.`
          : 'Another year on the licence.',
    });
  };

  const download = (asset: Asset) => {
    assetsCol.update(asset.id, {
      downloads: asset.downloads + 1,
      openedAt: new Date().toISOString(),
    });
    toast(`${asset.name} is on its way`, {
      description: `${weight(asset.bytes)}. The credit line goes with it.`,
    });
  };

  const retire = (asset: Asset) => {
    const usage = usageOf(asset, wall);
    if (inUse(usage)) {
      toast.error(`${asset.name} is still showing somewhere`, {
        description: 'Point that at something else first, then retire this.',
      });
      return;
    }
    assetsCol.update(asset.id, { status: 'retired' });
    setOpenId(null);
    toast.success(`${asset.name} is retired`, {
      description: `${weight(asset.bytes)} back, and it stops turning up in searches.`,
    });
  };

  const bind = (canvas: Canvas, assetId: string) => {
    canvasesCol.update(canvas.id, { assetId: assetId === '' ? undefined : assetId });
    const asset = assets.find((row) => row.id === assetId);
    toast.success(
      asset === undefined ? `${canvas.title} is showing nothing` : `${canvas.title} now shows ${asset.name}`,
      { description: 'Every screen carrying that poster changes on its next loop.' },
    );
  };

  const upload = (draft: NewAsset) => {
    const made = assetsCol.create({
      name: draft.name,
      kind: draft.kind,
      format: draft.format,
      bytes: draft.bytes,
      url: draft.url,
      width: draft.width,
      height: draft.height,
      shelfId: draft.shelfId,
      owner: me,
      status: 'draft',
      tags: draft.tags,
      licence: draft.licence,
      credit: draft.credit === '' ? undefined : draft.credit,
      expiresOn: draft.expiresOn === '' ? undefined : draft.expiresOn,
      version: 1,
      history: [],
      downloads: 0,
      openedAt: new Date().toISOString(),
    });

    setAdding(false);
    setOpenId(made.id);
    setLens('shelves');
    toast.success(`${draft.name} is in the vault`, {
      description: 'Send it for a brand check when you want it out on the screens.',
    });
  };

  const sendForCheck = (asset: Asset) => {
    assetsCol.update(asset.id, { status: 'review', reviewer: me });
    toast(`${asset.name} is with ${me}`, { description: 'It shows under Waiting on a check.' });
  };

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">Vault · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">Nothing in here is just stored</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              Every file knows what is reading it and how long it is allowed to. Replace one and the
              screens follow; let a licence lapse and they stop on their own, before anybody has to
              notice.
            </p>
          </div>

          <button type="button" onClick={() => setAdding(true)} className="dx-btn-primary">
            <UploadCloud size={15} aria-hidden="true" />
            Put something in
          </button>
        </div>

        <section aria-label="The vault at a glance" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <section aria-labelledby="vault-heading" className="dx-card min-w-0 overflow-hidden">
            <h3 id="vault-heading" className="sr-only">
              Everything kept here
            </h3>

            <Toolbar
              lenses={lenses}
              lens={lens}
              onLens={setLens}
              filters={filters}
              onFilters={setFilters}
              shelves={shelves}
              withFilters={lens === 'shelves'}
            />

            {lens === 'shelves' &&
              (shown.length === 0 ? (
                <EmptyState
                  icon={Images}
                  title="Nothing here matches what you are looking for."
                  actionLabel="Clear the filters"
                  onAction={() => setFilters(NO_FILTERS)}
                />
              ) : (
                <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((asset) => (
                    <li key={asset.id}>
                      <AssetCard
                        asset={asset}
                        usage={usageOf(asset, wall)}
                        selected={asset.id === openId}
                        onOpen={() => setOpenId(asset.id)}
                      />
                    </li>
                  ))}
                </ul>
              ))}

            {lens === 'usage' && (
              <UsagePanel
                assets={assets}
                wall={wall}
                onBind={bind}
                onOpen={(asset) => setOpenId(asset.id)}
              />
            )}

            {lens === 'rights' && (
              <RightsTable
                assets={assets}
                wall={wall}
                onOpen={(asset) => setOpenId(asset.id)}
                onRenew={renew}
              />
            )}

            {lens === 'dead' && (
              <DeadWeight
                assets={assets}
                wall={wall}
                shelves={shelves}
                onOpen={(asset) => setOpenId(asset.id)}
                onRetire={retire}
                onBrowse={() => setLens('shelves')}
              />
            )}
          </section>

          <aside className="space-y-5">
            <div className="dx-card px-4 py-4">
              <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                <ShieldCheck size={12} aria-hidden="true" />
                Waiting on your eye
              </p>
              {waiting.length === 0 ? (
                <p className="text-[0.8125rem] text-ink-muted">
                  Everything has been looked at. Anything new lands here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {waiting.slice(0, 4).map((asset) => (
                    <li key={asset.id} className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenId(asset.id)}
                        className="min-w-0 flex-1 truncate text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-[180ms] hover:text-brand-700"
                      >
                        {asset.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(asset)}
                        className="shrink-0 rounded-sm px-2 py-0.5 text-[0.75rem] text-brand-700 transition-colors duration-[180ms] hover:bg-brand-50"
                      >
                        Sign off
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dx-card px-4 py-4">
              <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                <UploadCloud size={12} aria-hidden="true" />
                Drafts nobody has checked
              </p>
              {assets.filter((asset) => asset.status === 'draft').length === 0 ? (
                <p className="text-[0.8125rem] text-ink-muted">Every draft has been sent on.</p>
              ) : (
                <ul className="space-y-2">
                  {assets
                    .filter((asset) => asset.status === 'draft')
                    .slice(0, 4)
                    .map((asset) => (
                      <li key={asset.id} className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setOpenId(asset.id)}
                          className="min-w-0 flex-1 truncate text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-[180ms] hover:text-brand-700"
                        >
                          {asset.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => sendForCheck(asset)}
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
              <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                <HardDrive size={12} aria-hidden="true" />
                What it all weighs
              </p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                {assets.length} files, {weight(held)} between them. {weight(reclaimable(assets, wall))}{' '}
                of that is pointed at nothing and has not been opened in three months.
              </p>
              <p className="mt-2.5 text-[0.75rem] text-ink-subtle">
                {assets.filter(usable).length} are signed off and in date, so they are the only ones
                a screen will paint.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {open !== null && (
        <AssetDialog
          key={open.id}
          asset={open}
          usage={usageOf(open, wall)}
          shelves={shelves}
          onClose={() => setOpenId(null)}
          onSave={(edit) => save(open, edit)}
          onApprove={() => approve(open)}
          onSendBack={(note) => sendBack(open, note)}
          onReplace={(url, bytes, note) => replace(open, url, bytes, note)}
          onRestore={(version) => restore(open, version)}
          onRenew={() => renew(open)}
          onDownload={() => download(open)}
          onRetire={() => retire(open)}
        />
      )}

      {adding && (
        <UploadDialog
          shelves={shelves}
          shelfId={filters.shelf}
          existing={assets}
          onClose={() => setAdding(false)}
          onUpload={upload}
        />
      )}
    </div>
  );
}
