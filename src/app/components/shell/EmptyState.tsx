import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="grid min-h-[16rem] place-items-center px-6 py-10 text-center">
      <div>
        <Icon size={22} className="mx-auto mb-3 text-ink-subtle" aria-hidden="true" />
        <p className="text-body text-ink">{title}</p>
        <button type="button" onClick={onAction} className="dx-btn-secondary mt-3">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
