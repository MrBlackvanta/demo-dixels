import { useMemo, useState } from 'react';
import { Minus, Plus, Stamp, X, Zap } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { useCollection } from '../../../lib/store';
import { spaces as spacesCol } from '../../../lib/data';
import { formatDay, money, shiftDay, todayKey } from '../../../lib/format';
import { FINANCE_FLOOR, SIGNOFF_FLOOR, chainFor, costCentreOf, costOf } from '../../../lib/catalogue';
import type { Service } from '../../../lib/catalogue';
import type { ServiceRequest } from '../../../lib/data';

const REASON_MIN = 20;

export interface Draft {
  choice: string;
  quantity: number;
  reason: string;
  neededBy: string;
  spaceId: string;
  place: string;
}

type Errors = Partial<Record<'reason' | 'neededBy' | 'place', string>>;

const FOCUS_ORDER: Array<keyof Errors> = ['reason', 'neededBy', 'place'];

interface OrderDialogProps {
  service: Service;
  me: string;
  team: string;
  open: ServiceRequest[];
  onClose: () => void;
  onSend: (draft: Draft & { deliverTo: string; unitCost: number }) => void;
}

export function OrderDialog({ service, me, team, open, onClose, onSend }: OrderDialogProps) {
  const allSpaces = useCollection(spacesCol);
  const earliest = shiftDay(todayKey(), service.leadDays);

  const [draft, setDraft] = useState<Draft>({
    choice: service.choices[0].label,
    quantity: 1,
    reason: '',
    neededBy: earliest,
    spaceId: '',
    place: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const unitCost = costOf(service, draft.choice);
  const total = unitCost * draft.quantity;
  const chain = useMemo(
    () => chainFor(service, me, team, total),
    [service, me, team, total],
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key === 'spaceId' ? 'place' : key]: undefined }));
  };

  const step = (by: number) =>
    setDraft((current) => ({
      ...current,
      quantity: Math.min(service.maxQuantity, Math.max(1, current.quantity + by)),
    }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const found: Errors = {};
    if (draft.reason.trim().length < REASON_MIN)
      found.reason = 'Say what it is for — whoever signs it will only see this line.';
    else if (open.some((row) => row.serviceId === service.id))
      found.reason = `You already have a ${service.name.toLowerCase()} on the way.`;

    if (draft.neededBy < earliest)
      found.neededBy = `The desk needs until ${formatDay(earliest).toLowerCase()} for this one.`;

    if (!draft.spaceId && !draft.place.trim()) found.place = 'Where should it go?';

    setErrors(found);

    const first = FOCUS_ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`order-${first}`)?.focus();
      return;
    }

    const space = allSpaces.find((row) => row.id === draft.spaceId);
    onSend({
      ...draft,
      unitCost,
      deliverTo: space ? `${space.name} · ${space.level}` : draft.place.trim(),
    });
  };

  const Icon = service.icon;

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl">
        <header className="relative shrink-0 overflow-hidden border-b border-line bg-nt-50 px-6 py-5">
          <Icon
            size={104}
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-4 text-brand-600/[0.06]"
          />

          <div className="relative flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="dx-eyebrow mb-1">OmniServe · {service.category}</p>
              <h2 className="dx-h4">{service.name}</h2>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                {service.blurb}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="dx-btn-ghost -mr-2 -mt-1 shrink-0"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {service.choices.length > 1 && (
              <fieldset>
                <legend className="dx-eyebrow mb-2">Which one</legend>
                <div className="space-y-2">
                  {service.choices.map((choice) => (
                    <button
                      key={choice.label}
                      type="button"
                      onClick={() => set('choice', choice.label)}
                      aria-pressed={draft.choice === choice.label}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-[180ms]',
                        draft.choice === choice.label
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-line hover:border-line-strong',
                      )}
                    >
                      <span
                        className={cn(
                          'truncate text-body',
                          draft.choice === choice.label
                            ? 'font-medium text-brand-700'
                            : 'text-ink',
                        )}
                      >
                        {choice.label}
                      </span>
                      <span className="shrink-0 text-body tabular-nums text-ink-muted">
                        {choice.cost === 0 ? 'No charge' : money(choice.cost)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {service.maxQuantity > 1 && (
                <div>
                  <span className="dx-eyebrow mb-1.5 block">How many</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      disabled={draft.quantity <= 1}
                      aria-label="One fewer"
                      className="dx-btn-secondary px-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-[2.5rem] text-center text-body font-medium tabular-nums text-ink"
                    >
                      {draft.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      disabled={draft.quantity >= service.maxQuantity}
                      aria-label="One more"
                      className="dx-btn-secondary px-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="order-neededBy" className="dx-eyebrow mb-1.5 block">
                  Wanted by
                </label>
                <input
                  id="order-neededBy"
                  type="date"
                  value={draft.neededBy}
                  min={earliest}
                  onChange={(event) => set('neededBy', event.target.value)}
                  aria-invalid={Boolean(errors.neededBy)}
                  aria-describedby={errors.neededBy ? 'order-neededBy-error' : undefined}
                  className="dx-field"
                />
                {errors.neededBy && (
                  <p
                    id="order-neededBy-error"
                    role="alert"
                    className="mt-1.5 text-[0.75rem] text-danger"
                  >
                    {errors.neededBy}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="order-reason" className="dx-eyebrow mb-1.5 block">
                What it is for
              </label>
              <textarea
                id="order-reason"
                data-autofocus
                value={draft.reason}
                onChange={(event) => set('reason', event.target.value)}
                rows={3}
                aria-invalid={Boolean(errors.reason)}
                aria-describedby={errors.reason ? 'order-reason-error' : 'order-reason-hint'}
                placeholder={service.needs}
                className="dx-field resize-none"
              />
              {errors.reason ? (
                <p id="order-reason-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.reason}
                </p>
              ) : (
                <p id="order-reason-hint" className="mt-1.5 text-[0.75rem] text-ink-muted">
                  {service.needs}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="order-place" className="dx-eyebrow mb-1.5 block">
                Where it goes
              </label>
              <select
                id="order-place"
                value={draft.spaceId}
                onChange={(event) => set('spaceId', event.target.value)}
                aria-invalid={Boolean(errors.place)}
                aria-describedby={errors.place ? 'order-place-error' : undefined}
                className="dx-field"
              >
                <option value="">Somewhere else</option>
                {allSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} · {space.level}
                  </option>
                ))}
              </select>

              {!draft.spaceId && (
                <input
                  value={draft.place}
                  onChange={(event) => set('place', event.target.value)}
                  placeholder="Desk 4-118 · Level 4"
                  aria-label="Describe where it goes"
                  className="dx-field mt-2"
                />
              )}

              {errors.place && (
                <p id="order-place-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.place}
                </p>
              )}
            </div>

            <section
              aria-label="Who signs this off"
              aria-live="polite"
              className={cn(
                'rounded-lg border px-4 py-3.5',
                chain.length === 0 ? 'border-grn-200 bg-grn-50' : 'border-brand-200 bg-brand-50',
              )}
            >
              <p
                className={cn(
                  'mb-2.5 flex items-center gap-1.5 text-[0.8125rem] font-medium',
                  chain.length === 0 ? 'text-grn-700' : 'text-brand-700',
                )}
              >
                {chain.length === 0 ? (
                  <Zap size={14} aria-hidden="true" />
                ) : (
                  <Stamp size={14} aria-hidden="true" />
                )}
                {chain.length === 0
                  ? 'Nobody has to sign this off'
                  : `${chain.length} ${chain.length === 1 ? 'person signs' : 'people sign'} this off`}
              </p>

              {chain.length === 0 ? (
                <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                  {total === 0
                    ? 'It costs nothing, so the desk picks it up the moment you send it.'
                    : `Under ${money(SIGNOFF_FLOOR)} the desk just gets on with it.`}
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {chain.map((link, index) => (
                    <li
                      key={link.role}
                      className="flex items-center gap-2 rounded-md bg-nt-0 px-3 py-2 text-[0.8125rem]"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-nt-100 text-[0.625rem] font-medium text-ink-muted"
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink">{link.approver}</span>
                      <span className="shrink-0 text-[0.75rem] text-ink-muted">{link.role}</span>
                    </li>
                  ))}
                </ol>
              )}

              {total >= FINANCE_FLOOR && (
                <p className="mt-2.5 text-[0.75rem] text-ink-muted">
                  Anything at or over {money(FINANCE_FLOOR)} goes past Finance as well.
                </p>
              )}
            </section>
          </div>

          <footer className="shrink-0 border-t border-line px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-body-lg font-medium tabular-nums text-ink">
                  {total === 0 ? 'No charge' : money(total)}
                </p>
                <p className="text-[0.75rem] text-ink-muted">
                  {costCentreOf(team)} · wanted {formatDay(draft.neededBy).toLowerCase()}
                </p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="dx-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="dx-btn-primary">
                  {chain.length === 0 ? 'Send it' : 'Send for approval'}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </div>
    </Modal>
  );
}
