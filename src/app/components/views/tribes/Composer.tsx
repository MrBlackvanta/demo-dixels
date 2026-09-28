import { useId, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../ui/utils';
import { initials } from '../../../lib/format';
import type { PostKind, Tribe } from '../../../lib/data';
import { KIND_LABEL } from './community';

const KINDS: PostKind[] = ['update', 'question', 'win'];

interface ComposerProps {
  tribes: Tribe[];
  me: string;
  tribeId?: string;
  onPost: (tribeId: string, kind: PostKind, body: string) => void;
}

export function Composer({ tribes, me, tribeId, onPost }: ComposerProps) {
  const fieldId = useId();
  const [target, setTarget] = useState(tribeId ?? tribes[0]?.id ?? '');
  const [kind, setKind] = useState<PostKind>('update');
  const [body, setBody] = useState('');

  const where = tribeId ?? target;
  const tribe = tribes.find((row) => row.id === where);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !where) return;
    onPost(where, kind, text);
    setBody('');
    setKind('update');
  };

  return (
    <form onSubmit={submit} className="dx-card p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[0.6875rem] font-medium text-brand-700"
        >
          {initials(me)}
        </span>

        <div className="min-w-0 flex-1">
          <label htmlFor={`${fieldId}-body`} className="sr-only">
            Write a post
          </label>
          <textarea
            id={`${fieldId}-body`}
            rows={body ? 3 : 1}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={
              tribe ? `Share something with ${tribe.name}` : 'Join a tribe to start posting'
            }
            disabled={!where}
            className="dx-field resize-none"
          />

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {!tribeId && (
              <>
                <label htmlFor={`${fieldId}-tribe`} className="sr-only">
                  Which tribe
                </label>
                <select
                  id={`${fieldId}-tribe`}
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  disabled={tribes.length === 0}
                  className="dx-field w-auto py-1.5 text-[0.75rem]"
                >
                  {tribes.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div role="group" aria-label="What kind of post" className="flex gap-1 rounded-lg bg-nt-50 p-1">
              {KINDS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={kind === entry}
                  onClick={() => setKind(entry)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[0.75rem] transition-all duration-[180ms]',
                    kind === entry
                      ? 'bg-nt-0 font-medium text-ink shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {KIND_LABEL[entry]}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!body.trim() || !where}
              className="dx-btn-primary ml-auto py-1.5"
            >
              <Send size={13} aria-hidden="true" />
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
