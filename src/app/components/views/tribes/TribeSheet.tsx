import { useId, useMemo, useState } from 'react';
import { CalendarDays, Lock, MapPin, ShieldCheck, Users, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { useCollection } from '../../../lib/store';
import { events as eventsCol, posts as postsCol } from '../../../lib/data';
import { formatDay, initials } from '../../../lib/format';
import { PEOPLE } from '../../../lib/seed';
import type { GatherEvent, Post, PostKind, Tribe } from '../../../lib/data';
import { byWhen, isGoing, isPast, seatsLeft } from '../gather/events';
import { Composer } from './Composer';
import { PostCard } from './PostCard';
import {
  CATEGORY_ICON,
  CATEGORY_TONE,
  isLead,
  isMember,
  isPending,
  liveIn,
  memberLabel,
  needsApproval,
  pinnedFirst,
} from './community';

const roleOf = (name: string): string => PEOPLE.find((person) => person.name === name)?.role ?? '';

type Pane = 'board' | 'events' | 'members';

const PANES: Array<{ id: Pane; label: string }> = [
  { id: 'board', label: 'Board' },
  { id: 'events', label: 'Events' },
  { id: 'members', label: 'Members' },
];

interface TribeSheetProps {
  tribe: Tribe;
  me: string;
  onClose: () => void;
  onToggle?: (tribe: Tribe) => void;
  onLike: (post: Post) => void;
  onReply: (post: Post, body: string) => void;
  onPost: (tribeId: string, kind: PostKind, body: string) => void;
  onRsvp: (event: GatherEvent) => void;
  onPin?: (post: Post) => void;
  onRemove?: (post: Post) => void;
}

export function TribeSheet({
  tribe,
  me,
  onClose,
  onToggle,
  onLike,
  onReply,
  onPost,
  onRsvp,
  onPin,
  onRemove,
}: TribeSheetProps) {
  const titleId = useId();
  const allPosts = useCollection(postsCol);
  const allEvents = useCollection(eventsCol);

  const [pane, setPane] = useState<Pane>('board');

  const Icon = CATEGORY_ICON[tribe.category];
  const tone = CATEGORY_TONE[tribe.category];
  const member = isMember(tribe, me);
  const pending = isPending(tribe, me);
  const lead = isLead(tribe, me);

  const board = useMemo(
    () => allPosts.filter((post) => post.tribeId === tribe.id).sort(pinnedFirst),
    [allPosts, tribe.id],
  );

  const coming = useMemo(
    () =>
      liveIn(allEvents, tribe.id)
        .filter((event) => !isPast(event))
        .sort(byWhen),
    [allEvents, tribe.id],
  );

  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="dx-card relative flex w-full max-w-3xl flex-col overflow-hidden rounded-b-none sm:rounded-b-lg"
      >
        <div className={cn('relative shrink-0 bg-gradient-to-br px-6 py-6', tone.wash)}>
          <Icon size={150} aria-hidden="true" className="absolute -right-8 -top-10 text-nt-0/15" />
          <div className="relative pr-10">
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-nt-0/75">
              {tribe.category}
              {needsApproval(tribe) && (
                <>
                  <span aria-hidden="true">·</span>
                  <Lock size={10} aria-hidden="true" />
                  By request
                </>
              )}
            </p>
            <h2 id={titleId} className="mt-1.5 text-[1.375rem] font-medium leading-tight text-nt-0">
              {tribe.name}
            </h2>
            <p className="mt-1.5 max-w-xl text-[0.875rem] leading-relaxed text-nt-0/85">
              {tribe.tagline}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-nt-0/15 text-nt-0 transition-colors duration-[180ms] hover:bg-nt-0/25"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line px-6 py-3.5">
          <ul className="flex -space-x-1.5" aria-hidden="true">
            {tribe.members.slice(0, 6).map((person) => (
              <li
                key={person}
                className="grid h-7 w-7 place-items-center rounded-full border border-nt-0 bg-nt-100 text-[0.5625rem] font-medium text-ink-muted"
              >
                {initials(person)}
              </li>
            ))}
          </ul>
          <p className="text-[0.8125rem] text-ink-muted">
            {memberLabel(tribe.members.length)} · led by {tribe.lead}
          </p>

          {lead || !onToggle ? (
            <span className="ml-auto flex items-center gap-1.5 rounded-md bg-brand-50 px-3 py-1.5 text-[0.8125rem] font-medium text-brand-700">
              <ShieldCheck size={13} aria-hidden="true" />
              You lead this
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(tribe)}
              aria-pressed={member || pending}
              className={cn(
                'ml-auto rounded-md border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all duration-[180ms]',
                member
                  ? 'border-grn-200 bg-grn-50 text-grn-700 hover:border-danger hover:bg-danger-bg hover:text-danger'
                  : pending
                    ? 'border-line bg-nt-50 text-ink-muted hover:border-danger hover:text-danger'
                    : 'border-brand-600 bg-brand-600 text-nt-0 hover:bg-brand-700',
              )}
            >
              {member
                ? 'Joined'
                : pending
                  ? 'Request sent'
                  : needsApproval(tribe)
                    ? 'Ask to join'
                    : 'Join this tribe'}
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-b border-line px-5 py-2.5">
          {PANES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={pane === entry.id}
              onClick={() => setPane(entry.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-colors duration-[180ms]',
                pane === entry.id ? 'bg-nt-100 font-medium text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {entry.label}
              {entry.id === 'events' && coming.length > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 text-[0.625rem] font-medium text-nt-0">
                  {coming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-nt-50 px-5 py-4">
          {pane === 'board' && (
            <>
              <p className="rounded-lg border border-line bg-nt-0 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                {tribe.about}
              </p>

              {member && (
                <Composer tribes={[tribe]} me={me} tribeId={tribe.id} onPost={onPost} />
              )}

              {board.length === 0 ? (
                <p className="py-10 text-center text-[0.8125rem] text-ink-muted">
                  Nothing on the board yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {board.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      me={me}
                      onLike={onLike}
                      onReply={onReply}
                      onPin={onPin}
                      onRemove={onRemove}
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          {pane === 'events' &&
            (coming.length === 0 ? (
              <p className="py-10 text-center text-[0.8125rem] text-ink-muted">
                {tribe.name} has nothing on the calendar right now.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {coming.map((event) => {
                  const going = isGoing(event, me);
                  const left = seatsLeft(event);

                  return (
                    <li key={event.id} className="dx-card flex flex-wrap items-center gap-3 px-4 py-3.5">
                      <span
                        aria-hidden="true"
                        className={cn('h-8 w-1 shrink-0 rounded-full', tone.bar)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.875rem] font-medium text-ink">{event.title}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-[0.75rem] text-ink-muted">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} aria-hidden="true" />
                            {formatDay(event.date)} · {event.start}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} aria-hidden="true" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} aria-hidden="true" />
                            {event.going.length}/{event.capacity}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRsvp(event)}
                        aria-pressed={going}
                        className={cn(
                          'shrink-0 rounded-md border px-3 py-1.5 text-[0.75rem] font-medium transition-all duration-[180ms]',
                          going
                            ? 'border-grn-200 bg-grn-50 text-grn-700 hover:border-danger hover:bg-danger-bg hover:text-danger'
                            : 'border-brand-600 bg-brand-600 text-nt-0 hover:bg-brand-700',
                        )}
                      >
                        {going ? 'Going' : left === 0 ? 'Join waitlist' : "I'm in"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

          {pane === 'members' && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {tribe.members.map((person) => (
                <li key={person} className="dx-card flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
                  >
                    {initials(person)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.8125rem] font-medium text-ink">{person}</p>
                    <p className="truncate text-[0.75rem] text-ink-muted">{roleOf(person)}</p>
                  </div>
                  {person === tribe.lead && (
                    <span className="ml-auto shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] font-medium text-brand-700">
                      Lead
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-6 py-3.5">
          <MapPin size={13} className="shrink-0 text-ink-subtle" aria-hidden="true" />
          <p className="text-[0.75rem] text-ink-muted">{tribe.home}</p>
          <ul className="ml-auto flex flex-wrap gap-1.5">
            {tribe.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] text-ink-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
