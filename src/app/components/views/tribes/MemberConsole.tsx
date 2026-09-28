import { useMemo, useState } from 'react';
import { Compass, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import {
  CURRENT_USER,
  events as eventsCol,
  posts as postsCol,
  tribes as tribesCol,
} from '../../../lib/data';
import { formatDay } from '../../../lib/format';
import type { GatherEvent, Post, PostKind, Tribe } from '../../../lib/data';
import { isFull, isGoing, isPast, isWaiting, join, leave } from '../gather/events';
import { Composer } from './Composer';
import { PostCard } from './PostCard';
import { Toolbar } from './Toolbar';
import type { View } from './Toolbar';
import { TribeCard } from './TribeCard';
import { TribeSheet } from './TribeSheet';
import {
  NO_FILTERS,
  byNewest,
  isMember,
  isPending,
  knock,
  liveIn,
  matchesFilters,
  needsApproval,
  toggleLike,
  withReply,
  withdraw,
} from './community';
import type { Filters } from './community';

const me = CURRENT_USER.name;

export function MemberConsole() {
  const allTribes = useCollection(tribesCol);
  const allPosts = useCollection(postsCol);
  const allEvents = useCollection(eventsCol);

  const [view, setView] = useState<View>('feed');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Tribe | null>(null);

  const live = useMemo(() => allTribes.filter((tribe) => !tribe.archived), [allTribes]);

  const mine = useMemo(() => live.filter((tribe) => isMember(tribe, me)), [live]);

  const shown = useMemo(() => {
    const pool = view === 'mine' ? mine : live;
    return pool.filter((tribe) => matchesFilters(tribe, filters));
  }, [view, mine, live, filters]);

  const feed = useMemo(() => {
    const ids = new Set(mine.map((tribe) => tribe.id));
    const needle = filters.search.trim().toLowerCase();

    return allPosts
      .filter((post) => ids.has(post.tribeId))
      .filter(
        (post) =>
          !needle ||
          `${post.author} ${post.body}`.toLowerCase().includes(needle) ||
          (allTribes.find((tribe) => tribe.id === post.tribeId)?.name ?? '')
            .toLowerCase()
            .includes(needle),
      )
      .sort(byNewest);
  }, [allPosts, allTribes, mine, filters.search]);

  const tribeById = useMemo(
    () => new Map(allTribes.map((tribe) => [tribe.id, tribe])),
    [allTribes],
  );

  const eventsFromMine = useMemo(
    () =>
      mine.flatMap((tribe) => liveIn(allEvents, tribe.id)).filter((event) => !isPast(event)).length,
    [mine, allEvents],
  );

  const stats = [
    { label: 'Tribes you are in', value: mine.length, tone: 'brand' as const },
    { label: 'Events from your tribes', value: eventsFromMine, tone: 'green' as const },
    {
      label: 'Open to join',
      value: live.filter((tribe) => !isMember(tribe, me) && !isPending(tribe, me)).length,
      tone: 'neutral' as const,
    },
  ];

  const toggle = (tribe: Tribe) => {
    const current = tribesCol.find(tribe.id) ?? tribe;
    const leaving = isMember(current, me) || isPending(current, me);
    const before = { members: current.members, pending: current.pending };
    const next = leaving ? withdraw(current, me) : knock(current, me);

    tribesCol.update(current.id, next);
    setOpen((sheet) => (sheet && sheet.id === current.id ? { ...sheet, ...next } : sheet));

    toast.success(
      leaving
        ? `You left ${current.name}`
        : needsApproval(current)
          ? `${current.lead} has your request`
          : `Welcome to ${current.name}`,
      {
        description: leaving
          ? 'Its posts drop out of your feed.'
          : needsApproval(current)
            ? 'You will get in as soon as they approve it.'
            : `${current.home} · led by ${current.lead}`,
        action: {
          label: 'Undo',
          onClick: () => {
            tribesCol.update(current.id, before);
            setOpen((sheet) => (sheet && sheet.id === current.id ? { ...sheet, ...before } : sheet));
          },
        },
      },
    );
  };

  const like = (post: Post) => postsCol.update(post.id, toggleLike(post, me));

  const reply = (post: Post, body: string) => {
    postsCol.update(post.id, withReply(post, me, body));
    toast.success(`Replied to ${post.author}`);
  };

  const write = (tribeId: string, kind: PostKind, body: string) => {
    const tribe = tribeById.get(tribeId);
    const created = postsCol.create({
      tribeId,
      author: me,
      body,
      at: new Date().toISOString(),
      kind,
      likes: [],
      replies: [],
      pinned: false,
    });

    toast.success(`Posted to ${tribe?.name ?? 'your tribe'}`, {
      description: `${tribe?.members.length ?? 0} people see it.`,
      action: { label: 'Undo', onClick: () => postsCol.remove(created.id) },
    });
  };

  const rsvp = (event: GatherEvent) => {
    const current = eventsCol.find(event.id) ?? event;
    const leaving = isGoing(current, me) || isWaiting(current, me);
    const before = { going: current.going, waitlist: current.waitlist };

    eventsCol.update(current.id, leaving ? leave(current, me) : join(current, me));

    toast.success(
      leaving
        ? `You are out of ${current.title}`
        : isFull(current)
          ? `You are on the waitlist for ${current.title}`
          : `You are going to ${current.title}`,
      {
        description: `${formatDay(current.date)} · ${current.start} · ${current.location}`,
        action: { label: 'Undo', onClick: () => eventsCol.update(current.id, before) },
      },
    );
  };

  return (
    <>
      <div className="mb-7">
        <p className="dx-eyebrow mb-2">Tribes · {CURRENT_USER.building}</p>
        <h2 className="dx-h2 text-balance">The people behind the desks</h2>
        <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
          Clubs, guilds and standing invitations. Join one and its board lands in your feed.
        </p>
      </div>

      <section aria-label="Your tribes at a glance" className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="dx-card px-5 py-4">
            <CountUp
              value={stat.value}
              className={cn(
                'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                stat.tone === 'brand' && 'text-brand-600',
                stat.tone === 'green' && 'text-grn-500',
                stat.tone === 'neutral' && 'text-ink',
              )}
            />
            <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="tribes-heading" className="dx-card overflow-hidden">
        <h3 id="tribes-heading" className="sr-only">
          Tribes
        </h3>

        <Toolbar
          view={view}
          onView={setView}
          filters={filters}
          onFilters={setFilters}
          mineCount={mine.length}
        />

        {view === 'feed' ? (
          <div className="space-y-3 bg-nt-50 p-4">
            <Composer tribes={mine} me={me} onPost={write} />

            {feed.length === 0 ? (
              <div className="grid min-h-[12rem] place-items-center px-6 py-10 text-center">
                <div>
                  <MessagesSquare
                    size={22}
                    className="mx-auto mb-3 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <p className="text-body text-ink">
                    {mine.length === 0
                      ? 'Join a tribe and its board shows up here.'
                      : 'Nothing matches that search yet.'}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      mine.length === 0 ? setView('discover') : setFilters(NO_FILTERS)
                    }
                    className="dx-btn-secondary mt-3"
                  >
                    {mine.length === 0 ? 'Find a tribe' : 'Clear the search'}
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {feed.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    tribe={tribeById.get(post.tribeId)}
                    me={me}
                    onLike={like}
                    onReply={reply}
                    onOpenTribe={setOpen}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : shown.length === 0 ? (
          <div className="grid min-h-[16rem] place-items-center px-6 py-10 text-center">
            <div>
              <Compass size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
              <p className="text-body text-ink">
                {view === 'mine'
                  ? 'You have not joined anything yet.'
                  : 'Nothing matches those filters.'}
              </p>
              <button
                type="button"
                onClick={() => (view === 'mine' ? setView('discover') : setFilters(NO_FILTERS))}
                className="dx-btn-secondary mt-3"
              >
                {view === 'mine' ? 'Browse tribes' : 'Clear the filters'}
              </button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((tribe) => (
              <TribeCard
                key={tribe.id}
                tribe={tribe}
                me={me}
                events={liveIn(allEvents, tribe.id).filter((event) => !isPast(event)).length}
                onOpen={setOpen}
                onToggle={toggle}
              />
            ))}
          </ul>
        )}
      </section>

      {open && (
        <TribeSheet
          tribe={open}
          me={me}
          onClose={() => setOpen(null)}
          onToggle={toggle}
          onLike={like}
          onReply={reply}
          onPost={write}
          onRsvp={rsvp}
        />
      )}
    </>
  );
}
