import { CircleSlash, Clock, PackageCheck, Stamp, Truck, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import type { RequestStage } from '../../../lib/data';
import { STAGE_LABEL, STAGE_TONE } from './desk';

const STAGE_ICON: Record<RequestStage, LucideIcon> = {
  approval: Stamp,
  arranging: Truck,
  ready: PackageCheck,
  delivered: Clock,
  declined: X,
  cancelled: CircleSlash,
};

interface StageChipProps {
  stage: RequestStage;
  label?: string;
}

export function StageChip({ stage, label }: StageChipProps) {
  const Icon = STAGE_ICON[stage];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
        STAGE_TONE[stage],
      )}
    >
      <Icon size={11} aria-hidden="true" />
      {label ?? STAGE_LABEL[stage]}
    </span>
  );
}
