import { todayKey } from './format';
import type { Asset } from './data';

export const expired = (asset: Pick<Asset, 'expiresOn'>): boolean =>
  asset.expiresOn !== undefined && asset.expiresOn < todayKey();

export const usable = (asset: Pick<Asset, 'status' | 'expiresOn'>): boolean =>
  asset.status === 'approved' && !expired(asset);

export const daysLeft = (asset: Pick<Asset, 'expiresOn'>): number | undefined => {
  if (asset.expiresOn === undefined) return undefined;
  const then = new Date(`${asset.expiresOn}T00:00:00`).getTime();
  const now = new Date(`${todayKey()}T00:00:00`).getTime();
  return Math.round((then - now) / 86_400_000);
};
