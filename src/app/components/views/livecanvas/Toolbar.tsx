import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';

export interface Lens {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ToolbarProps {
  lenses: Lens[];
  lens: string;
  onLens: (lens: string) => void;
  heading: string;
}

export function Toolbar({ lenses, lens, onLens, heading }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
      <p aria-live="polite" className="min-w-0 shrink-0 text-[0.875rem] font-medium text-ink">
        {heading}
      </p>

      <div className="ml-auto min-w-0 max-w-full overflow-x-auto">
        <div
          role="tablist"
          aria-label="How to look at the network"
          className="flex w-max gap-1 rounded-lg bg-nt-50 p-1"
        >
          {lenses.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={lens === entry.id}
              onClick={() => onLens(entry.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.8125rem] transition-all duration-[180ms]',
                lens === entry.id
                  ? 'bg-nt-0 font-medium text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <entry.icon size={14} aria-hidden="true" />
              {entry.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
