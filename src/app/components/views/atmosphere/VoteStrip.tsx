import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import { cn } from '../../ui/utils';
import { VERDICT_LABEL } from '../../../lib/climate';
import type { Consensus, Tally } from '../../../lib/climate';
import type { ComfortVerdict } from '../../../lib/data';
import { VERDICT_TONE, people } from './comfort';

const ORDER: ComfortVerdict[] = ['cold', 'cool', 'right', 'warm', 'hot'];

interface VoteStripProps {
  tally: Tally;
  mine?: ComfortVerdict;
  consensus: Consensus;
  canNudge: boolean;
  onVote: (verdict: ComfortVerdict) => void;
  onNudge: (by: number) => void;
}

export function VoteStrip({ tally, mine, consensus, canNudge, onVote, onNudge }: VoteStripProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ORDER.map((verdict) => {
          const voters = tally[verdict];
          const on = mine === verdict;
          return (
            <button
              key={verdict}
              type="button"
              aria-pressed={on}
              onClick={() => onVote(verdict)}
              title={voters.length > 0 ? voters.join(', ') : 'Nobody has said this'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.75rem] transition-all duration-[180ms]',
                on ? VERDICT_TONE[verdict] : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
              )}
            >
              {on && <Check size={11} aria-hidden="true" />}
              {VERDICT_LABEL[verdict]}
              {voters.length > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[0.625rem] tabular-nums',
                    on ? 'bg-nt-0/70' : 'bg-nt-100',
                  )}
                >
                  {voters.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {consensus.direction !== 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/35 bg-warning-bg px-3.5 py-3">
          <p className="min-w-0 flex-1 text-[0.8125rem] text-ink">
            {people(consensus.people.length)} in here say it is{' '}
            {consensus.direction > 0 ? 'too cold' : 'too warm'} —{' '}
            <span className="text-ink-muted">{consensus.people.join(', ')}</span>
          </p>
          {canNudge && (
            <button
              type="button"
              onClick={() => onNudge(consensus.nudge)}
              className="dx-btn-secondary shrink-0"
            >
              {consensus.direction > 0 ? (
                <ArrowUp size={14} aria-hidden="true" />
              ) : (
                <ArrowDown size={14} aria-hidden="true" />
              )}
              Move it {Math.abs(consensus.nudge).toFixed(1)}°
            </button>
          )}
        </div>
      )}
    </div>
  );
}
