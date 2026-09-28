import { useMemo, useState } from 'react';
import { CalendarPlus, Pencil, Search, Trash2, UserRoundPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, visits as visitsCol } from '../../../lib/data';
import { todayKey } from '../../../lib/format';
import type { Visit } from '../../../lib/data';
import { GuestPass } from './GuestPass';
import { InviteDialog } from './InviteDialog';
import type { Draft } from './InviteDialog';
import { VisitRow } from './VisitRow';
import { byStartTime, isActive, matches } from './visits';

type Range = 'today' | 'upcoming' | 'past';

const RANGES: Array<{ id: Range; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

export function HostConsole() {
  const all = useCollection(visitsCol);
  const [range, setRange] = useState<Range>('today');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<Visit | null>(null);

  const mine = useMemo(() => all.filter((visit) => visit.host === CURRENT_USER.name), [all]);

  const buckets = useMemo(() => {
    const key = todayKey();
    return {
      today: mine.filter((visit) => visit.date === key && isActive(visit)),
      upcoming: mine.filter((visit) => visit.date > key && isActive(visit)),
      past: mine.filter(
        (visit) => visit.date < key || visit.status === 'checked-out' || visit.status === 'cancelled',
      ),
    };
  }, [mine]);

  const listed = useMemo(
    () => buckets[range].filter((visit) => matches(visit, query)).sort(byStartTime),
    [buckets, range, query],
  );

  const selected = listed.find((visit) => visit.id === selectedId) ?? listed[0] ?? null;
  const onSite = mine.filter((visit) => visit.status === 'checked-in').length;

  const save = (draft: Draft, target: Visit | null, code: string) => {
    if (target) {
      visitsCol.update(target.id, { ...draft, code });
      toast.success('Visit updated', { description: `${draft.guest} has the new details.` });
    } else {
      const created = visitsCol.create({
        ...draft,
        host: CURRENT_USER.name,
        status: 'invited',
        code,
      });
      setSelectedId(created.id);
      setRange(draft.date === todayKey() ? 'today' : 'upcoming');
      toast.success('Invitation sent', { description: `${draft.guest} · pass ${code}` });
    }
    setInviting(false);
    setEditing(null);
  };

  const cancelVisit = (visit: Visit) => {
    visitsCol.update(visit.id, { status: 'cancelled' });
    toast.success('Visit cancelled', { description: `${visit.guest} has been told.` });
  };

  const stats = [
    { label: 'Expected today', value: buckets.today.length, tone: 'brand' as const },
    { label: 'On site now', value: onSite, tone: 'green' as const },
    { label: 'Upcoming', value: buckets.upcoming.length, tone: 'neutral' as const },
  ];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">VisitFlow · Host</p>
          <h2 className="dx-h2 text-balance">Who's coming to see you?</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            Invite a guest and they arrive with a pass, directions and a parking bay.
          </p>
        </div>
        <button type="button" onClick={() => setInviting(true)} className="dx-btn-primary">
          <UserRoundPlus size={15} aria-hidden="true" />
          Invite a guest
        </button>
      </div>

      <section aria-label="Your visitors at a glance" className="mb-5 grid grid-cols-3 gap-3">
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
        <section aria-labelledby="visits-heading" className="dx-card overflow-hidden">
          <h3 id="visits-heading" className="sr-only">
            Your visits
          </h3>

          <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center">
            <div
              role="tablist"
              aria-label="Visit range"
              className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={range === item.id}
                  onClick={() => setRange(item.id)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    range === item.id
                      ? 'bg-ink font-medium text-nt-0'
                      : 'text-ink-muted hover:bg-nt-100 hover:text-ink',
                  )}
                >
                  {item.label}
                  <span className="ml-1.5 tabular-nums opacity-60">{buckets[item.id].length}</span>
                </button>
              ))}
            </div>

            <div className="relative sm:ml-auto sm:w-52">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search guests"
                aria-label="Search your guests"
                className="dx-field py-2 pl-9 text-[0.8125rem]"
              />
            </div>
          </div>

          {listed.length === 0 ? (
            <div className="grid min-h-[18rem] place-items-center px-6 text-center">
              <div>
                <CalendarPlus size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
                <p className="text-body text-ink">
                  {query ? `No guest matches “${query}”.` : 'Nothing booked in this window.'}
                </p>
                <button
                  type="button"
                  onClick={() => (query ? setQuery('') : setInviting(true))}
                  className="dx-btn-ghost mt-3"
                >
                  {query ? 'Clear the search' : 'Invite your first guest'}
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {listed.map((visit) => (
                <li key={visit.id}>
                  <VisitRow
                    visit={visit}
                    selected={selected?.id === visit.id}
                    onSelect={(next) => setSelectedId(next.id)}
                    showDay={range !== 'today'}
                    actions={
                      isActive(visit) ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing(visit)}
                            aria-label={`Edit the visit for ${visit.guest}`}
                            className="dx-btn-ghost px-2"
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelVisit(visit)}
                            aria-label={`Cancel the visit for ${visit.guest}`}
                            className="dx-btn-ghost px-2 hover:bg-danger-bg hover:text-danger"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </>
                      ) : null
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          {selected ? (
            <section aria-labelledby="pass-heading" className="space-y-3">
              <h3 id="pass-heading" className="dx-eyebrow">
                Their pass
              </h3>
              <GuestPass visit={selected} />
              {selected.notes && (
                <p className="rounded-md bg-nt-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-ink-muted">
                  {selected.notes}
                </p>
              )}
            </section>
          ) : (
            <div className="dx-card grid min-h-[12rem] place-items-center px-5 text-center">
              <p className="text-[0.8125rem] text-ink-muted">
                Pick a guest to see the pass they receive.
              </p>
            </div>
          )}
        </aside>
      </div>

      {(inviting || editing) && (
        <InviteDialog
          editing={editing}
          onClose={() => {
            setInviting(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </>
  );
}
