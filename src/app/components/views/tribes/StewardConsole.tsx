import { useMemo, useState } from 'react';
import { Archive, ArchiveRestore, Lock, Pencil, Trash2, UserPlus, Users, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import {
  events as eventsCol,
  posts as postsCol,
  tribes as tribesCol,
} from '../../../lib/data';
import { formatDay, initials } from '../../../lib/format';
import type { GatherEvent, Post, PostKind, Tribe } from '../../../lib/data';
import { isFull, isGoing, isPast, isWaiting, join, leave } from '../gather/events';
import { TribeDialog, draftFrom, emptyDraft } from './TribeDialog';
import type { Draft } from './TribeDialog';
import { TribeSheet } from './TribeSheet';
import {
  CATEGORY_TONE,
  approve,
  decline,
  liveIn,
  memberLabel,
  needsApproval,
  toggleLike,
  withReply,
} from './community';

type Lens = 'active' | 'request' | 'archived';

const LENSES: Array<{ id: Lens; label: string }> = [
  { id: 'active', label: 'Running' },
  { id: 'request', label: 'By request' },
  { id: 'archived', label: 'Archived' },
];

export function StewardConsole() {
  const allTribes = useCollection(tribesCol);
  const allPosts = useCollection(postsCol);
  const allEvents = useCollection(eventsCol);

  const [lens, setLens] = useState<Lens>('active');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Tribe | null>(null);
  const [viewing, setViewing] = useState<Tribe | null>(null);

  const shown = useMemo(() => {
    const rows = [...allTribes].sort((a, b) => b.members.length - a.members.length);
    if (lens === 'archived') return rows.filter((tribe) => tribe.archived);
    if (lens === 'request') return rows.filter((tribe) => !tribe.archived && needsApproval(tribe));
    return rows.filter((tribe) => !tribe.archived);
  }, [allTribes, lens]);

  const requests = useMemo(
    () =>
      allTribes
        .filter((tribe) => !tribe.archived)
        .flatMap((tribe) => tribe.pending.map((person) => ({ tribe, person }))),
    [allTribes],
  );

  const running = allTribes.filter((tribe) => !tribe.archived);
  const reached = new Set(running.flatMap((tribe) => tribe.members)).size;

  const stats = [
    { label: 'Tribes running', value: running.length, tone: 'brand' as const },
    { label: 'People in at least one', value: reached, tone: 'green' as const },
    { label: 'Waiting to be let in', value: requests.length, tone: 'neutral' as const },
  ];

  const postsIn = (tribeId: string) => allPosts.filter((post) => post.tribeId === tribeId).length;

  const save = (next: Draft, target: Tribe | null) => {
    const shape = {
      name: next.name.trim(),
      category: next.category,
      tagline: next.tagline.trim(),
      about: next.about.trim(),
      lead: next.lead,
      home: next.home.trim(),
      access: next.access,
      tags: next.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (target) {
      const members = target.members.includes(shape.lead)
        ? target.members
        : [...target.members, shape.lead];
      tribesCol.update(target.id, { ...shape, members });
      toast.success(`${shape.name} updated`, {
        description: `${members.length} members see it straight away.`,
      });
    } else {
      const created = tribesCol.create({
        ...shape,
        members: [shape.lead],
        pending: [],
        archived: false,
      });
      setLens(shape.access === 'request' ? 'request' : 'active');
      toast.success(`${shape.name} is live`, {
        description: `${shape.lead} leads it and is the first member.`,
        action: { label: 'Undo', onClick: () => tribesCol.remove(created.id) },
      });
    }

    setDraft(null);
    setEditing(null);
  };

  const archive = (tribe: Tribe) => {
    tribesCol.update(tribe.id, { archived: !tribe.archived });
    toast.success(tribe.archived ? `${tribe.name} is back` : `${tribe.name} archived`, {
      description: tribe.archived
        ? 'It shows up in Discover again.'
        : `${memberLabel(tribe.members.length)} keep the board, nobody new can join.`,
      action: {
        label: 'Undo',
        onClick: () => tribesCol.update(tribe.id, { archived: tribe.archived }),
      },
    });
  };

  const remove = (tribe: Tribe) => {
    const board = postsIn(tribe.id);

    if (tribe.members.length > 1) {
      toast.error(`${tribe.name} still has ${tribe.members.length} members`, {
        description: 'Archive it instead so nobody loses the board.',
      });
      return;
    }

    allPosts
      .filter((post) => post.tribeId === tribe.id)
      .forEach((post) => postsCol.remove(post.id));
    tribesCol.remove(tribe.id);

    toast.success(`${tribe.name} deleted`, {
      description: board > 0 ? `${board} posts went with it.` : undefined,
    });
  };

  const letIn = (tribe: Tribe, person: string) => {
    const before = { members: tribe.members, pending: tribe.pending };
    tribesCol.update(tribe.id, approve(tribe, person));
    toast.success(`${person} is in ${tribe.name}`, {
      description: `${tribe.members.length + 1} members now.`,
      action: { label: 'Undo', onClick: () => tribesCol.update(tribe.id, before) },
    });
  };

  const turnAway = (tribe: Tribe, person: string) => {
    const before = { pending: tribe.pending };
    tribesCol.update(tribe.id, decline(tribe, person));
    toast.success(`${person} was not added to ${tribe.name}`, {
      action: { label: 'Undo', onClick: () => tribesCol.update(tribe.id, before) },
    });
  };

  const leadOf = (post: Post): string =>
    allTribes.find((row) => row.id === post.tribeId)?.lead ?? post.author;

  const like = (post: Post) => postsCol.update(post.id, toggleLike(post, leadOf(post)));

  const reply = (post: Post, body: string) =>
    postsCol.update(post.id, withReply(post, leadOf(post), body));

  const write = (tribeId: string, kind: PostKind, body: string) => {
    const tribe = allTribes.find((row) => row.id === tribeId);
    postsCol.create({
      tribeId,
      author: tribe?.lead ?? 'Workplace',
      body,
      at: new Date().toISOString(),
      kind,
      likes: [],
      replies: [],
      pinned: false,
    });
    toast.success(`Posted to ${tribe?.name ?? 'the board'}`);
  };

  const pin = (post: Post) => {
    postsCol.update(post.id, { pinned: !post.pinned });
    toast.success(post.pinned ? 'Unpinned' : 'Pinned to the top of the board');
  };

  const take = (post: Post) => {
    postsCol.remove(post.id);
    toast.success(`${post.author}'s post was taken down`, {
      action: { label: 'Undo', onClick: () => postsCol.create(post) },
    });
  };

  const rsvp = (event: GatherEvent) => {
    const current = eventsCol.find(event.id) ?? event;
    const host = current.host;
    const leaving = isGoing(current, host) || isWaiting(current, host);
    eventsCol.update(current.id, leaving ? leave(current, host) : join(current, host));
    toast.success(
      leaving
        ? `${host} is out of ${current.title}`
        : isFull(current)
          ? `${host} joined the waitlist`
          : `${host} is going to ${current.title}`,
      { description: `${formatDay(current.date)} · ${current.start}` },
    );
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">Tribes · communities</p>
          <h2 className="dx-h2 text-balance">Who gathers, and around what</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Every club in the building, who leads it, and who is waiting at the door.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDraft(emptyDraft());
          }}
          className="dx-btn-primary"
        >
          <Users size={15} aria-hidden="true" />
          Start a tribe
        </button>
      </div>

      <section aria-label="Communities at a glance" className="mb-5 grid grid-cols-3 gap-3">
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

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <section aria-labelledby="communities-heading" className="dx-card min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 border-b border-line px-4 py-3">
            <h3 id="communities-heading" className="sr-only">
              Every tribe
            </h3>
            {LENSES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={lens === entry.id}
                onClick={() => setLens(entry.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[0.8125rem] transition-colors duration-[180ms]',
                  lens === entry.id
                    ? 'bg-nt-100 font-medium text-ink'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="px-6 py-12 text-center text-[0.8125rem] text-ink-muted">
              Nothing here yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {shown.map((tribe) => {
                const tone = CATEGORY_TONE[tribe.category];
                const coming = liveIn(allEvents, tribe.id).filter((event) => !isPast(event)).length;

                return (
                  <li key={tribe.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone.bar)}
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setViewing(tribe)}
                          className="block max-w-full truncate text-left text-[0.875rem] font-medium text-ink hover:text-brand-700"
                        >
                          {tribe.name}
                        </button>
                        <p className="truncate text-[0.75rem] text-ink-muted">
                          {tribe.category} · led by {tribe.lead} · {tribe.home}
                        </p>
                      </div>
                      {needsApproval(tribe) && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] font-medium text-ink-subtle">
                          <Lock size={9} aria-hidden="true" />
                          By request
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-5">
                      <span className="flex items-center gap-1 text-[0.6875rem] text-ink-muted">
                        <Users size={11} aria-hidden="true" />
                        {tribe.members.length}
                      </span>
                      <span className="rounded-full bg-nt-50 px-2 py-0.5 text-[0.625rem] text-ink-muted">
                        {postsIn(tribe.id)} posts
                      </span>
                      {coming > 0 && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] text-brand-700">
                          {coming} in Gather
                        </span>
                      )}
                      {tribe.pending.length > 0 && (
                        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[0.625rem] font-medium text-warning">
                          {tribe.pending.length} waiting
                        </span>
                      )}

                      <span className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => archive(tribe)}
                          className="dx-btn-ghost px-2 py-1 text-[0.75rem]"
                        >
                          {tribe.archived ? (
                            <ArchiveRestore size={12} aria-hidden="true" />
                          ) : (
                            <Archive size={12} aria-hidden="true" />
                          )}
                          {tribe.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(tribe);
                            setDraft(draftFrom(tribe));
                          }}
                          aria-label={`Edit ${tribe.name}`}
                          className="dx-btn-ghost px-2 py-1"
                        >
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(tribe)}
                          aria-label={`Delete ${tribe.name}`}
                          className="dx-btn-ghost px-2 py-1 hover:bg-danger-bg hover:text-danger"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section aria-labelledby="requests-heading" className="dx-card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h3 id="requests-heading" className="dx-eyebrow">
                Waiting to be let in
              </h3>
            </div>

            {requests.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.8125rem] text-ink-muted">
                Nobody is queuing at a door.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {requests.map(({ tribe, person }) => (
                  <li key={`${tribe.id}-${person}`} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
                      >
                        {initials(person)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-medium text-ink">{person}</p>
                        <p className="truncate text-[0.75rem] text-ink-muted">{tribe.name}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 pl-10">
                      <button
                        type="button"
                        onClick={() => letIn(tribe, person)}
                        className="dx-btn-ghost px-2 py-1 text-[0.75rem] hover:bg-grn-50 hover:text-grn-700"
                      >
                        <UserPlus size={12} aria-hidden="true" />
                        Let in
                      </button>
                      <button
                        type="button"
                        onClick={() => turnAway(tribe, person)}
                        className="dx-btn-ghost px-2 py-1 text-[0.75rem] hover:bg-danger-bg hover:text-danger"
                      >
                        <X size={12} aria-hidden="true" />
                        Not now
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {draft && (
        <TribeDialog
          tribes={allTribes}
          editing={editing}
          initial={draft}
          onClose={() => {
            setDraft(null);
            setEditing(null);
          }}
          onSave={save}
        />
      )}

      {viewing && (
        <TribeSheet
          tribe={viewing}
          me={viewing.lead}
          onClose={() => setViewing(null)}
          onLike={like}
          onReply={reply}
          onPost={write}
          onRsvp={rsvp}
          onPin={pin}
          onRemove={take}
        />
      )}
    </>
  );
}
