import { Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { timeAgo } from '../../../lib/format';
import { describeRule } from '../../../lib/climate';
import { KIND_NAME } from '../../../lib/agenda';
import type { Rule, Scene, Space } from '../../../lib/data';
import { glyphIcon } from './comfort';

interface RuleListProps {
  rules: Rule[];
  scenes: Scene[];
  spaces: Space[];
  me: string;
  onToggle: (rule: Rule) => void;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
}

export function RuleList({
  rules,
  scenes,
  spaces,
  me,
  onToggle,
  onEdit,
  onDelete,
}: RuleListProps) {
  return (
    <ul className="divide-y divide-line">
      {rules.map((rule) => {
        const scene = scenes.find((row) => row.id === rule.sceneId);
        const Icon = glyphIcon(scene?.glyph ?? 'focus');
        const mine = rule.owner === me;

        return (
          <li key={rule.id} className="flex flex-wrap items-start gap-3 px-4 py-4 sm:flex-nowrap">
            <span
              className={cn(
                'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md',
                rule.active ? 'bg-brand-50 text-brand-700' : 'bg-nt-100 text-ink-subtle',
              )}
            >
              <Icon size={15} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={cn(
                    'text-[0.875rem] font-medium',
                    rule.active ? 'text-ink' : 'text-ink-muted',
                  )}
                >
                  {rule.name}
                </h4>
                {rule.kind !== undefined && (
                  <span className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] text-ink-muted">
                    {KIND_NAME[rule.kind]} only
                  </span>
                )}
              </div>

              <p className="mt-1 text-[0.8125rem] text-ink-muted">
                {describeRule(rule, spaces, scenes)}
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-subtle">
                <span className="inline-flex items-center gap-1">
                  <Clock size={10} aria-hidden="true" />
                  {rule.runs === 0
                    ? 'Never run'
                    : `Run ${rule.runs} times · last ${timeAgo(rule.lastRun ?? '')}`}
                </span>
                {!mine && <span>Kept by {rule.owner}</span>}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {mine && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(rule)}
                    aria-label={`Edit ${rule.name}`}
                    className="dx-btn-ghost w-9 px-0"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(rule)}
                    aria-label={`Delete ${rule.name}`}
                    className="dx-btn-ghost w-9 px-0 text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </>
              )}

              <button
                type="button"
                role="switch"
                aria-checked={rule.active}
                aria-label={`${rule.name} is ${rule.active ? 'on' : 'off'}`}
                onClick={() => onToggle(rule)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-all duration-[180ms]',
                  rule.active ? 'bg-brand-600' : 'bg-nt-200',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-nt-0 shadow-sm transition-all duration-[180ms]',
                    rule.active ? 'left-[1.375rem]' : 'left-0.5',
                  )}
                />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
