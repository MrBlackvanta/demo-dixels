import { weight } from '../../../lib/format';
import { showing } from '../../../lib/publishing';
import { daysLeft, expired, usable } from '../../../lib/rights';
import type {
  Asset,
  AssetKind,
  AssetLicence,
  AssetStatus,
  AssetVersion,
  Canvas,
  Channel,
  Entry,
  Screen,
  Shelf,
} from '../../../lib/data';

export { daysLeft, expired, usable, weight };

export const KINDS: Array<{ id: AssetKind; label: string; plural: string }> = [
  { id: 'image', label: 'Picture', plural: 'Pictures' },
  { id: 'video', label: 'Video', plural: 'Video' },
  { id: 'document', label: 'Document', plural: 'Documents' },
];

export const STATUSES: Array<{ id: AssetStatus; label: string; tone: string }> = [
  { id: 'draft', label: 'Draft', tone: 'bg-nt-100 text-ink-muted' },
  { id: 'review', label: 'Waiting on a check', tone: 'bg-warning/12 text-warning' },
  { id: 'approved', label: 'Signed off', tone: 'bg-success/12 text-success' },
  { id: 'retired', label: 'Retired', tone: 'bg-nt-100 text-ink-subtle' },
];

export const LICENCES: Array<{ id: AssetLicence; label: string; blurb: string }> = [
  { id: 'owned', label: 'Ours', blurb: 'Made in house. It never runs out.' },
  { id: 'commissioned', label: 'Commissioned', blurb: 'Shot for us and bought outright.' },
  { id: 'stock', label: 'Agency stock', blurb: 'Bought in for a term, and the term ends.' },
  { id: 'pictured', label: 'People in it', blurb: 'Somebody signed a release, and a release expires.' },
];

export const kindOf = (kind: AssetKind) => KINDS.find((row) => row.id === kind) ?? KINDS[0];

export const statusOf = (status: AssetStatus) =>
  STATUSES.find((row) => row.id === status) ?? STATUSES[0];

export const licenceOf = (licence: AssetLicence) =>
  LICENCES.find((row) => row.id === licence) ?? LICENCES[0];

export const runtime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

export const shape = (asset: Asset): string =>
  asset.width === undefined || asset.height === undefined
    ? asset.format
    : `${asset.width} × ${asset.height}`;

export interface Wall {
  canvases: Canvas[];
  channels: Channel[];
  screens: Screen[];
  entries: Entry[];
}

export interface Usage {
  screens: number;
  pointedAt: number;
  boards: string[];
  notices: string[];
  onToday: boolean;
  inHelp: boolean;
}

const screensBehind = (wall: Wall, canvasIds: string[]): Set<string> => {
  const wanted = new Set(canvasIds);
  const carrying = new Set(
    wall.channels
      .filter((channel) => channel.canvasIds.some((id) => wanted.has(id)))
      .map((channel) => channel.id),
  );
  return new Set(
    wall.screens
      .filter((screen) => screen.status !== 'dark' && carrying.has(screen.channelId))
      .map((screen) => screen.id),
  );
};

export function usageOf(asset: Asset, wall: Wall): Usage {
  const posters = wall.canvases.filter((canvas) => canvas.assetId === asset.id);
  const notices = wall.entries.filter((entry) => entry.heroId === asset.id && showing(entry));
  const noticeIds = new Set(notices.map((entry) => entry.id));
  const noticeBoards = wall.canvases.filter(
    (canvas) => canvas.entryId !== undefined && noticeIds.has(canvas.entryId),
  );

  const reached = screensBehind(wall, [...posters, ...noticeBoards].map((canvas) => canvas.id));

  return {
    screens: usable(asset) ? reached.size : 0,
    pointedAt: reached.size,
    boards: posters.map((canvas) => canvas.title),
    notices: notices.map((entry) => entry.title),
    onToday: notices.some((entry) => entry.surfaces.includes('today')),
    inHelp: notices.some((entry) => entry.surfaces.includes('resolve')),
  };
}

export const inUse = (usage: Usage): boolean =>
  usage.boards.length > 0 || usage.notices.length > 0;

export const usageLabel = (usage: Usage): string => {
  const parts: string[] = [];
  if (usage.screens > 0) {
    parts.push(`${usage.screens} ${usage.screens === 1 ? 'screen' : 'screens'}`);
  }
  if (usage.onToday) parts.push('the home page');
  if (usage.inHelp) parts.push('the help desk');

  if (parts.length === 0) {
    if (usage.pointedAt > 0) {
      return `Held — ${usage.pointedAt} ${usage.pointedAt === 1 ? 'screen is' : 'screens are'} showing a holding card`;
    }
    return inUse(usage) ? 'Held, showing nowhere' : 'Nowhere yet';
  }
  if (parts.length === 1) return `On ${parts[0]}`;
  return `On ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

const IDLE_DAYS = 90;

export const idle = (asset: Asset, usage: Usage): boolean => {
  if (inUse(usage)) return false;
  if (asset.status === 'retired') return true;
  if (asset.openedAt === undefined) return true;
  return Date.now() - new Date(asset.openedAt).getTime() > IDLE_DAYS * 86_400_000;
};

export const reclaimable = (assets: Asset[], wall: Wall): number =>
  assets
    .filter((asset) => idle(asset, usageOf(asset, wall)))
    .reduce((sum, asset) => sum + asset.bytes, 0);

export const RUNNING_OUT_DAYS = 30;

export const runningOut = (asset: Asset): boolean => {
  const left = daysLeft(asset);
  return left !== undefined && left >= 0 && left <= RUNNING_OUT_DAYS;
};

export const expiryLabel = (asset: Asset): string => {
  const left = daysLeft(asset);
  if (left === undefined) return 'No end date';
  if (left < 0) return `Ran out ${Math.abs(left)} days ago`;
  if (left === 0) return 'Runs out today';
  if (left === 1) return 'Runs out tomorrow';
  return `${left} days left`;
};

export interface Filters {
  text: string;
  shelf: string;
  kind: AssetKind | 'all';
  status: AssetStatus | 'all';
}

export const NO_FILTERS: Filters = { text: '', shelf: 'all', kind: 'all', status: 'all' };

export const activeFilterCount = (filters: Filters): number =>
  [filters.kind, filters.status].filter((value) => value !== 'all').length;

export function match(asset: Asset, filters: Filters): boolean {
  if (filters.shelf !== 'all' && asset.shelfId !== filters.shelf) return false;
  if (filters.kind !== 'all' && asset.kind !== filters.kind) return false;
  if (filters.status !== 'all' && asset.status !== filters.status) return false;

  const needle = filters.text.trim().toLowerCase();
  if (needle === '') return true;

  return [asset.name, asset.owner, asset.credit ?? '', ...asset.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

const RANK: Record<AssetStatus, number> = { review: 0, draft: 1, approved: 2, retired: 3 };

export const byUrgency = (a: Asset, b: Asset): number =>
  RANK[a.status] - RANK[b.status] || b.updatedAt.localeCompare(a.updatedAt);

export const bySoonestExpiry = (a: Asset, b: Asset): number =>
  (daysLeft(a) ?? Infinity) - (daysLeft(b) ?? Infinity);

export const byWeight = (a: Asset, b: Asset): number => b.bytes - a.bytes;

export interface Edit {
  name: string;
  shelfId: string;
  tags: string;
  licence: AssetLicence;
  credit: string;
  restriction: string;
  expiresOn: string;
}

export const editFrom = (asset: Asset): Edit => ({
  name: asset.name,
  shelfId: asset.shelfId,
  tags: asset.tags.join(', '),
  licence: asset.licence,
  credit: asset.credit ?? '',
  restriction: asset.restriction ?? '',
  expiresOn: asset.expiresOn ?? '',
});

export const tagsFrom = (text: string): string[] =>
  text
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 10);

export const detailed = (edit: Edit): Partial<Asset> => ({
  name: edit.name.trim(),
  shelfId: edit.shelfId,
  tags: tagsFrom(edit.tags),
  licence: edit.licence,
  credit: edit.credit.trim() === '' ? undefined : edit.credit.trim(),
  restriction: edit.restriction.trim() === '' ? undefined : edit.restriction.trim(),
  expiresOn: edit.expiresOn === '' ? undefined : edit.expiresOn,
});

export const unchanged = (asset: Asset, edit: Edit): boolean =>
  JSON.stringify(detailed(edit)) === JSON.stringify(detailed(editFrom(asset)));

export function replaced(asset: Asset, url: string, bytes: number, note: string): Partial<Asset> {
  const previous: AssetVersion = {
    version: asset.version,
    savedAt: asset.updatedAt,
    savedBy: asset.owner,
    note: asset.reviewNote ?? 'The file as it was',
    url: asset.url,
    bytes: asset.bytes,
  };

  return {
    url,
    bytes,
    version: asset.version + 1,
    history: [...asset.history, previous],
    reviewNote: note,
  };
}

export const shelfName = (shelves: Shelf[], id: string): string =>
  shelves.find((shelf) => shelf.id === id)?.name ?? 'Loose files';
