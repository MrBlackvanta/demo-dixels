import { useMemo, useState } from 'react';
import { LogOut, Search, UserRoundPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { useCollection } from '../../../lib/store';
import { badges as badgesCol, visits as visitsCol } from '../../../lib/data';
import { todayKey } from '../../../lib/format';
import type { Visit } from '../../../lib/data';
import { CheckInDialog } from './CheckInDialog';
import { Deliveries } from './Deliveries';
import { InviteDialog } from './InviteDialog';
import type { Draft } from './InviteDialog';
import { VisitRow } from './VisitRow';
import { byStartTime, matches } from './visits';

type Board = 'expected' | 'onsite' | 'gone';

const BOARDS: Array<{ id: Board; label: string }> = [
  { id: 'expected', label: 'Expected' },
  { id: 'onsite', label: 'On site' },
  { id: 'gone', label: 'Departed' },
];

export function FrontDesk() {
  const all = useCollection(visitsCol);
  const badges = useCollection(badgesCol);
  const [board, setBoard] = useState<Board>('expected');
  const [query, setQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState<Visit | null>(null);
  const [walkIn, setWalkIn] = useState(false);

  const boards = useMemo(() => {
    const key = todayKey();
    const todays = all.filter((visit) => visit.date === key);
    return {
      expected: todays.filter((visit) => visit.status === 'invited' || visit.status === 'pre-registered'),
      onsite: todays.filter((visit) => visit.status === 'checked-in'),
      gone: todays.filter((visit) => visit.status === 'checked-out'),
    };
  }, [all]);

  const listed = useMemo(
    () => boards[board].filter((visit) => matches(visit, query)).sort(byStartTime),
    [boards, board, query],
  );

  const freeBadges = badges.filter((badge) => !badge.visitId).length;

  const checkIn = (visit: Visit, badgeNumber: string) => {
    if (badgeNumber) {
      const badge = badges.find((row) => row.number === badgeNumber);
      if (badge) badgesCol.update(badge.id, { visitId: visit.id });
    }

    visitsCol.update(visit.id, {
      status: 'checked-in',
      badge: badgeNumber || undefined,
      arrivedAt: new Date().toISOString(),
    });

    setCheckingIn(null);
    setBoard('onsite');
    toast.success(`${visit.guest} is in`, {
      description: badgeNumber ? `Badge ${badgeNumber} · ${visit.location ?? 'Reception'}` : visit.location,
    });
  };

  const checkOut = (visit: Visit) => {
    const badge = badges.find((row) => row.visitId === visit.id);
    if (badge) badgesCol.update(badge.id, { visitId: undefined });

    visitsCol.update(visit.id, { status: 'checked-out', leftAt: new Date().toISOString() });
    toast.success(`${visit.guest} checked out`, {
      description: badge ? `Badge ${badge.number} back in the tray.` : undefined,
    });
  };

  const registerWalkIn = (draft: Draft, _editing: Visit | null, code: string) => {
    const created = visitsCol.create({
      ...draft,
      host: 'Front desk',
      status: 'pre-registered',
      code,
    });
    setWalkIn(false);
    setBoard('expected');
    toast.success('Walk-in registered', { description: `${created.guest} · pass ${code}` });
  };

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dx-eyebrow mb-2">VisitFlow · Front desk</p>
          <h2 className="dx-h2 text-balance">Reception, Riyadh HQ</h2>
          <p className="mt-2 text-body-lg text-ink-muted">
            {boards.expected.length} still expected · {boards.onsite.length} in the building ·{' '}
            {freeBadges} {freeBadges === 1 ? 'badge' : 'badges'} free
          </p>
        </div>
        <button type="button" onClick={() => setWalkIn(true)} className="dx-btn-primary">
          <UserRoundPlus size={15} aria-hidden="true" />
          Register a walk-in
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <section aria-labelledby="board-heading" className="dx-card overflow-hidden">
          <h3 id="board-heading" className="sr-only">
            Arrivals board
          </h3>

          <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center">
            <div
              role="tablist"
              aria-label="Arrivals"
              className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {BOARDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={board === item.id}
                  onClick={() => setBoard(item.id)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                    board === item.id
                      ? 'bg-ink font-medium text-nt-0'
                      : 'text-ink-muted hover:bg-nt-100 hover:text-ink',
                  )}
                >
                  {item.label}
                  <span className="ml-1.5 tabular-nums opacity-60">{boards[item.id].length}</span>
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
                placeholder="Name, company or code"
                aria-label="Find a visitor"
                className="dx-field py-2 pl-9 text-[0.8125rem]"
              />
            </div>
          </div>

          {listed.length === 0 ? (
            <div className="grid min-h-[18rem] place-items-center px-6 text-center">
              <div>
                <p className="text-body text-ink">
                  {query ? `Nobody matches “${query}”.` : 'This board is clear.'}
                </p>
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="dx-btn-ghost mt-3">
                    Clear the search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {listed.map((visit) => (
                <li key={visit.id}>
                  <VisitRow
                    visit={visit}
                    actions={
                      visit.status === 'checked-in' ? (
                        <button
                          type="button"
                          onClick={() => checkOut(visit)}
                          className="dx-btn-secondary ml-3 shrink-0 px-2.5 py-1.5 text-[0.8125rem]"
                        >
                          <LogOut size={13} aria-hidden="true" />
                          Out
                        </button>
                      ) : visit.status === 'checked-out' ? null : (
                        <button
                          type="button"
                          onClick={() => setCheckingIn(visit)}
                          className="dx-btn-primary ml-3 shrink-0 px-3 py-1.5 text-[0.8125rem]"
                        >
                          Check in
                        </button>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section aria-labelledby="badges-heading" className="dx-card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h3 id="badges-heading" className="dx-eyebrow">
                Badge tray
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {badges.map((badge) => {
                const holder = badge.visitId ? all.find((visit) => visit.id === badge.visitId) : null;
                return (
                  <span
                    key={badge.id}
                    title={holder ? `With ${holder.guest}` : 'In the tray'}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-[0.75rem] tabular-nums',
                      holder
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-line bg-nt-0 text-ink-muted',
                    )}
                  >
                    {badge.number}
                  </span>
                );
              })}
            </div>
          </section>

          <Deliveries />
        </aside>
      </div>

      {checkingIn && (
        <CheckInDialog visit={checkingIn} onClose={() => setCheckingIn(null)} onConfirm={checkIn} />
      )}

      {walkIn && (
        <InviteDialog walkIn editing={null} onClose={() => setWalkIn(false)} onSave={registerWalkIn} />
      )}
    </>
  );
}
