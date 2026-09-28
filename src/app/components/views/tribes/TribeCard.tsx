import { Lock, MapPin, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { initials } from '../../../lib/format';
import type { Tribe } from '../../../lib/data';
import {
  CATEGORY_ICON,
  CATEGORY_TONE,
  isLead,
  isMember,
  isPending,
  memberLabel,
  needsApproval,
} from './community';

interface TribeCardProps {
  tribe: Tribe;
  me: string;
  events: number;
  onOpen: (tribe: Tribe) => void;
  onToggle: (tribe: Tribe) => void;
}

export function TribeCard({ tribe, me, events, onOpen, onToggle }: TribeCardProps) {
  const Icon = CATEGORY_ICON[tribe.category];
  const tone = CATEGORY_TONE[tribe.category];
  const member = isMember(tribe, me);
  const pending = isPending(tribe, me);
  const lead = isLead(tribe, me);
  const roster = tribe.members.slice(0, 5);

  return (
    <li className="dx-card group flex flex-col overflow-hidden transition-shadow duration-[180ms] hover:shadow-raise">
      <button
        type="button"
        onClick={() => onOpen(tribe)}
        aria-label={`Open ${tribe.name}`}
        className={cn(
          'relative flex h-24 items-end overflow-hidden bg-gradient-to-br px-4 pb-3 text-left',
          tone.wash,
        )}
      >
        <Icon
          size={96}
          aria-hidden="true"
          className="absolute -right-4 -top-5 text-nt-0/20 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="relative">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-nt-0/75">
            {tribe.category}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-[0.9375rem] font-medium leading-snug text-nt-0">
            {tribe.name}
          </h3>
        </div>

        {needsApproval(tribe) && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-nt-0/85 px-2 py-0.5 text-[0.625rem] font-medium text-ink">
            <Lock size={9} aria-hidden="true" />
            By request
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-3 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-muted">
          {tribe.tagline}
        </p>

        <ul className="mb-3.5 space-y-1.5 text-[0.75rem] text-ink-muted">
          <li className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{tribe.home}</span>
          </li>
          {events > 0 && (
            <li className="flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone.bar)} aria-hidden="true" />
              {events === 1 ? '1 event coming up' : `${events} events coming up`}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ul className="flex -space-x-1.5" aria-hidden="true">
              {roster.map((person) => (
                <li
                  key={person}
                  className="grid h-6 w-6 place-items-center rounded-full border border-nt-0 bg-nt-100 text-[0.5625rem] font-medium text-ink-muted"
                >
                  {initials(person)}
                </li>
              ))}
            </ul>
            <span className="flex items-center gap-1 text-[0.6875rem] text-ink-muted">
              <Users size={11} aria-hidden="true" />
              <span aria-hidden="true">{tribe.members.length}</span>
              <span className="sr-only">{memberLabel(tribe.members.length)}</span>
            </span>
          </div>

          {lead ? (
            <span className="rounded-md bg-brand-50 px-2.5 py-1.5 text-[0.75rem] font-medium text-brand-700">
              You lead this
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(tribe)}
              aria-pressed={member || pending}
              className={cn(
                'rounded-md border px-3 py-1.5 text-[0.75rem] font-medium transition-all duration-[180ms]',
                member
                  ? 'border-grn-200 bg-grn-50 text-grn-700 hover:border-danger hover:bg-danger-bg hover:text-danger'
                  : pending
                    ? 'border-line bg-nt-50 text-ink-muted hover:border-danger hover:text-danger'
                    : 'border-brand-600 bg-brand-600 text-nt-0 hover:bg-brand-700',
              )}
            >
              {member ? 'Joined' : pending ? 'Requested' : needsApproval(tribe) ? 'Ask to join' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
