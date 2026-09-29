import { todayKey } from './format';
import type { Entry } from './data';

export const showing = (entry: Entry): boolean =>
  entry.status === 'live' ||
  (entry.status === 'scheduled' && entry.liveFrom !== undefined && entry.liveFrom <= todayKey());
