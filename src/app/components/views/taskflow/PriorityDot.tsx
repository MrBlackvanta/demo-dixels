import { cn } from '../../ui/utils';
import type { TaskPriority } from '../../../lib/data';
import { PRIORITY_LABEL, PRIORITY_TONE } from './plan';

interface PriorityDotProps {
  priority: TaskPriority;
  withLabel?: boolean;
}

export function PriorityDot({ priority, withLabel = false }: PriorityDotProps) {
  if (!withLabel) {
    return (
      <span
        title={`${PRIORITY_LABEL[priority]} priority`}
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', PRIORITY_TONE[priority])}
      >
        <span className="sr-only">{PRIORITY_LABEL[priority]} priority</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_TONE[priority])} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
