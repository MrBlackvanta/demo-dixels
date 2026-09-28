import { Briefcase, HandHeart, HeartPulse, Palette, PartyPopper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GatherEvent, Post, PostKind, Tribe, TribeCategory } from '../../../lib/data';

export const CATEGORIES: TribeCategory[] = [
  'Professional',
  'Wellness',
  'Social',
  'Creative',
  'Giving',
];

export const CATEGORY_ICON: Record<TribeCategory, LucideIcon> = {
  Professional: Briefcase,
  Wellness: HeartPulse,
  Social: PartyPopper,
  Creative: Palette,
  Giving: HandHeart,
};

export const CATEGORY_TONE: Record<TribeCategory, { chip: string; wash: string; bar: string }> = {
  Professional: { chip: 'bg-brand-50 text-brand-700', wash: 'from-brand-500/85 to-brand-800/85', bar: 'bg-brand-500' },
  Wellness: { chip: 'bg-grn-100 text-grn-700', wash: 'from-grn-500/85 to-brand-700/80', bar: 'bg-grn-500' },
  Social: { chip: 'bg-warning-bg text-warning', wash: 'from-warning/80 to-brand-700/85', bar: 'bg-warning' },
  Creative: { chip: 'bg-brand-100 text-brand-800', wash: 'from-brand-400/85 to-brand-700/85', bar: 'bg-brand-400' },
  Giving: { chip: 'bg-nt-200 text-ink', wash: 'from-nt-700/90 to-nt-950/90', bar: 'bg-nt-700' },
};

export const KIND_LABEL: Record<PostKind, string> = {
  update: 'Update',
  question: 'Question',
  win: 'Win',
};

export const KIND_TONE: Record<PostKind, string> = {
  update: 'bg-nt-100 text-ink-muted',
  question: 'bg-brand-50 text-brand-700',
  win: 'bg-grn-100 text-grn-700',
};

export const isMember = (tribe: Tribe, name: string): boolean => tribe.members.includes(name);

export const isPending = (tribe: Tribe, name: string): boolean => tribe.pending.includes(name);

export const isLead = (tribe: Tribe, name: string): boolean => tribe.lead === name;

export const needsApproval = (tribe: Tribe): boolean => tribe.access === 'request';

export const knock = (tribe: Tribe, name: string): Partial<Tribe> =>
  needsApproval(tribe)
    ? { pending: [...tribe.pending, name] }
    : { members: [...tribe.members, name] };

export const withdraw = (tribe: Tribe, name: string): Partial<Tribe> => ({
  members: tribe.members.filter((person) => person !== name),
  pending: tribe.pending.filter((person) => person !== name),
});

export const approve = (tribe: Tribe, name: string): Partial<Tribe> => ({
  members: [...tribe.members, name],
  pending: tribe.pending.filter((person) => person !== name),
});

export const decline = (tribe: Tribe, name: string): Partial<Tribe> => ({
  pending: tribe.pending.filter((person) => person !== name),
});

export const toggleLike = (post: Post, name: string): Partial<Post> => ({
  likes: post.likes.includes(name)
    ? post.likes.filter((person) => person !== name)
    : [...post.likes, name],
});

export const withReply = (post: Post, author: string, body: string): Partial<Post> => ({
  replies: [...post.replies, { author, body, at: new Date().toISOString() }],
});

export const byNewest = (a: Post, b: Post): number => b.at.localeCompare(a.at);

export const pinnedFirst = (a: Post, b: Post): number =>
  Number(b.pinned) - Number(a.pinned) || byNewest(a, b);

export const replyCount = (post: Post): number => post.replies.length;

export const liveIn = (events: GatherEvent[], tribeId: string): GatherEvent[] =>
  events.filter((event) => event.tribeId === tribeId && event.status === 'published');

export interface Filters {
  search: string;
  category: TribeCategory | 'all';
  openOnly: boolean;
}

export const NO_FILTERS: Filters = { search: '', category: 'all', openOnly: false };

export const activeFilterCount = (filters: Filters): number =>
  (filters.category === 'all' ? 0 : 1) + (filters.openOnly ? 1 : 0);

export const matchesFilters = (tribe: Tribe, filters: Filters): boolean => {
  if (filters.category !== 'all' && tribe.category !== filters.category) return false;
  if (filters.openOnly && needsApproval(tribe)) return false;

  const needle = filters.search.trim().toLowerCase();
  if (!needle) return true;

  return [tribe.name, tribe.tagline, tribe.about, tribe.lead, tribe.home, ...tribe.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle);
};

export const memberLabel = (count: number): string =>
  count === 1 ? '1 member' : `${count} members`;
