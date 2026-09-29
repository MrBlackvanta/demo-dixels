import { Play } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import type { Canvas, Screen, SignRule, SignTrigger } from '../../../lib/data';

const TRIGGER: Record<SignTrigger, string> = {
  'vip-arrives': 'A VIP badges in at reception',
  'event-opens': 'An event is fifteen minutes out',
  'room-frees': 'A booked room is given back',
  'route-shuts': 'A stair, lift or route closes',
  'air-turns': 'CO₂ on a floor passes 1,100 ppm',
};

interface RuleListProps {
  rules: SignRule[];
  canvases: Canvas[];
  screens: Screen[];
  onToggle: (rule: SignRule) => void;
  onFire: (rule: SignRule) => void;
}

export function RuleList({ rules, canvases, screens, onToggle, onFire }: RuleListProps) {
  return (
    <ul className="divide-y divide-line">
      {rules.map((rule) => {
        const canvas = canvases.find((row) => row.id === rule.canvasId);
        const targets = rule.screenIds
          .map((id) => screens.find((screen) => screen.id === id))
          .filter((screen): screen is Screen => screen !== undefined);

        return (
          <li key={rule.id} className="flex flex-wrap items-start gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[0.875rem] font-medium leading-tight text-ink">{rule.name}</p>

              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">
                When {TRIGGER[rule.trigger].toLowerCase()}, put{' '}
                <span className="text-ink">{canvas?.title ?? 'a canvas'}</span> on{' '}
                {targets.length === 0 ? 'nothing yet' : targets.map((row) => row.name).join(', ')} for{' '}
                {rule.holdMinutes} minutes.
              </p>

              <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
                {rule.firedAt === undefined
                  ? 'Has not fired yet.'
                  : `Last fired ${timeAgo(rule.firedAt)}${rule.firedFor === undefined ? '' : ` — ${rule.firedFor}`}.`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onFire(rule)}
                disabled={!rule.active}
                className="dx-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={13} aria-hidden="true" />
                Try it
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={rule.active}
                aria-label={`${rule.active ? 'Pause' : 'Turn on'} ${rule.name}`}
                onClick={() => onToggle(rule)}
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-[180ms]',
                  rule.active ? 'bg-brand-600' : 'bg-nt-300',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-nt-0 shadow-sm transition-transform duration-[180ms]',
                    rule.active ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
