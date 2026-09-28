import { useMemo, useState } from 'react';
import { BookOpenCheck, Sparkles, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Modal } from '../../shell/Modal';
import { useCollection } from '../../../lib/store';
import { spaces as spacesCol } from '../../../lib/data';
import type { Ticket, TicketPriority, TicketTeam } from '../../../lib/data';
import {
  AGENTS,
  CATEGORIES,
  PRIORITIES,
  PRIORITY_TARGET,
  PRIORITY_TONE,
  TEAMS,
  TEAM_BLURB,
  TEAM_ICON,
  suggest,
} from './support';

const SUBJECT_MIN = 10;
const DETAIL_MIN = 25;

interface Draft {
  subject: string;
  detail: string;
  team: TicketTeam;
  category: string;
  spaceId: string;
  place: string;
  priority: TicketPriority;
}

type Errors = Partial<Record<'subject' | 'detail' | 'place', string>>;

const FOCUS_ORDER: Array<keyof Errors> = ['subject', 'detail', 'place'];

const EMPTY: Draft = {
  subject: '',
  detail: '',
  team: 'IT',
  category: CATEGORIES.IT[0],
  spaceId: '',
  place: '',
  priority: 'medium',
};

const validate = (draft: Draft, open: Ticket[]): Errors => {
  const errors: Errors = {};
  const subject = draft.subject.trim();

  if (subject.length < SUBJECT_MIN) errors.subject = 'Say what is wrong in a few more words.';
  else if (open.some((row) => row.subject.toLowerCase() === subject.toLowerCase()))
    errors.subject = 'You already have an open request with that title.';

  if (draft.detail.trim().length < DETAIL_MIN)
    errors.detail = 'Tell them what you saw and what you already tried.';

  if (!draft.spaceId && !draft.place.trim()) errors.place = 'Where is it?';

  return errors;
};

interface TicketDialogProps {
  mine: Ticket[];
  onClose: () => void;
  onCreate: (draft: Omit<Draft, 'place'> & { location: string }) => void;
  onDeflect: (title: string) => void;
}

export function TicketDialog({ mine, onClose, onCreate, onDeflect }: TicketDialogProps) {
  const allSpaces = useCollection(spacesCol);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [reading, setReading] = useState<string | null>(null);

  const openMine = useMemo(() => mine.filter((row) => row.status !== 'resolved'), [mine]);

  const hints = useMemo(
    () => suggest(`${draft.subject} ${draft.detail}`),
    [draft.subject, draft.detail],
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => {
      if (key !== 'team') return { ...current, [key]: value };
      const team = value as TicketTeam;
      return { ...current, team, category: CATEGORIES[team][0] };
    });
    setErrors((current) => ({ ...current, [key === 'spaceId' ? 'place' : key]: undefined }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(draft, openMine);
    setErrors(found);

    const first = FOCUS_ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`ticket-${first}`)?.focus();
      return;
    }

    const space = allSpaces.find((row) => row.id === draft.spaceId);
    const { place, ...rest } = draft;
    onCreate({
      ...rest,
      location: space ? `${space.name} · ${space.level}` : place.trim(),
    });
  };

  const Glyph = TEAM_ICON[draft.team];

  return (
    <Modal onClose={onClose}>
      <div className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-nt-0 shadow-pop sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-6 py-5">
          <div className="flex-1">
            <p className="dx-eyebrow mb-1">Resolve</p>
            <h2 className="dx-h4">What do you need sorted?</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="dx-btn-ghost -mr-2">
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label htmlFor="ticket-subject" className="dx-eyebrow mb-1.5 block">
                In one line
              </label>
              <input
                id="ticket-subject"
                value={draft.subject}
                onChange={(event) => set('subject', event.target.value)}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? 'ticket-subject-error' : undefined}
                placeholder="The projector in Orchid will not pick up my laptop"
                className="dx-field"
              />
              {errors.subject && (
                <p id="ticket-subject-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.subject}
                </p>
              )}
            </div>

            {hints.length > 0 && (
              <section
                aria-label="Answers that might help"
                className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5"
              >
                <p className="mb-2.5 flex items-center gap-1.5 text-[0.8125rem] font-medium text-brand-700">
                  <Sparkles size={14} aria-hidden="true" />
                  This might already be answered
                </p>

                <ul className="space-y-2">
                  {hints.map((article) => (
                    <li key={article.id} className="rounded-md bg-nt-0 px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() => setReading(reading === article.id ? null : article.id)}
                        aria-expanded={reading === article.id}
                        className="flex w-full items-center gap-2 rounded-sm text-left text-body font-medium text-ink"
                      >
                        <BookOpenCheck size={14} aria-hidden="true" className="shrink-0 text-brand-600" />
                        {article.title}
                      </button>

                      {reading === article.id && (
                        <>
                          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                            {article.body}
                          </p>
                          <button
                            type="button"
                            onClick={() => onDeflect(article.title)}
                            className="dx-btn-secondary mt-2.5"
                          >
                            That answered it
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div>
              <label htmlFor="ticket-detail" className="dx-eyebrow mb-1.5 block">
                What is happening
              </label>
              <textarea
                id="ticket-detail"
                value={draft.detail}
                onChange={(event) => set('detail', event.target.value)}
                rows={3}
                aria-invalid={Boolean(errors.detail)}
                aria-describedby={errors.detail ? 'ticket-detail-error' : undefined}
                placeholder="What you saw, when it started, and anything you already tried."
                className="dx-field resize-none"
              />
              {errors.detail && (
                <p id="ticket-detail-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                  {errors.detail}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="dx-eyebrow mb-2">Who should see it</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {TEAMS.map((team) => {
                  const Icon = TEAM_ICON[team];
                  return (
                    <button
                      key={team}
                      type="button"
                      onClick={() => set('team', team)}
                      aria-pressed={draft.team === team}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[0.75rem] transition-all duration-[180ms]',
                        draft.team === team
                          ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                      )}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {team}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                <Glyph size={12} aria-hidden="true" className="shrink-0" />
                {TEAM_BLURB[draft.team]} {AGENTS[draft.team].length} on duty.
              </p>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ticket-category" className="dx-eyebrow mb-1.5 block">
                  Kind of problem
                </label>
                <select
                  id="ticket-category"
                  value={draft.category}
                  onChange={(event) => set('category', event.target.value)}
                  className="dx-field"
                >
                  {CATEGORIES[draft.team].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ticket-place" className="dx-eyebrow mb-1.5 block">
                  Where
                </label>
                <select
                  id="ticket-place"
                  value={draft.spaceId}
                  onChange={(event) => set('spaceId', event.target.value)}
                  aria-invalid={Boolean(errors.place)}
                  aria-describedby={errors.place ? 'ticket-place-error' : undefined}
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
                    placeholder="Level 4 · North wing"
                    aria-label="Describe where"
                    className="dx-field mt-2"
                  />
                )}

                {errors.place && (
                  <p id="ticket-place-error" role="alert" className="mt-1.5 text-[0.75rem] text-danger">
                    {errors.place}
                  </p>
                )}
              </div>
            </div>

            <fieldset>
              <legend className="dx-eyebrow mb-2">How urgent</legend>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => set('priority', priority)}
                    aria-pressed={draft.priority === priority}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-[0.8125rem] capitalize transition-all duration-[180ms]',
                      draft.priority === priority
                        ? cn('font-medium ring-1 ring-current', PRIORITY_TONE[priority])
                        : 'bg-nt-50 text-ink-muted hover:text-ink',
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.75rem] text-ink-muted">
                {draft.team} aims to be with you {PRIORITY_TARGET[draft.priority]}.
              </p>
            </fieldset>
          </div>

          <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-6 py-4">
            <button type="button" onClick={onClose} className="dx-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="dx-btn-primary">
              Raise it
            </button>
          </footer>
        </form>
      </div>
    </Modal>
  );
}
