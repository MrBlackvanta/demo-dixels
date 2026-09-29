import { cn } from '../../ui/utils';
import type { CanvasTone, ScreenShape } from '../../../lib/data';
import type { Frame } from './paint';

const TONE: Record<CanvasTone, { wash: string; rule: string; eyebrow: string }> = {
  brand: {
    wash: 'from-brand-950 via-brand-900 to-nt-950',
    rule: 'bg-brand-400',
    eyebrow: 'text-brand-200',
  },
  ink: {
    wash: 'from-nt-900 via-nt-950 to-nt-900',
    rule: 'bg-nt-400',
    eyebrow: 'text-nt-300',
  },
  green: {
    wash: 'from-grn-700 via-grn-700 to-nt-950',
    rule: 'bg-grn-200',
    eyebrow: 'text-grn-100',
  },
  warm: {
    wash: 'from-nt-950 via-nt-900 to-nt-950',
    rule: 'bg-warning',
    eyebrow: 'text-warning',
  },
};

interface ScreenCanvasProps {
  frame: Frame;
  shape: ScreenShape;
  size: 'tile' | 'stage';
  dark?: boolean;
  progress?: number;
  fill?: boolean;
}

export function ScreenCanvas({ frame, shape, size, dark, progress, fill }: ScreenCanvasProps) {
  const tone = TONE[frame.tone];
  const stage = size === 'stage';
  const box = fill
    ? 'absolute inset-0'
    : cn('relative w-full', shape === 'portrait' ? 'aspect-[9/16]' : 'aspect-video');

  if (dark) {
    return (
      <div className={cn('grid place-items-center overflow-hidden rounded-[0.25rem] bg-nt-950', box)}>
        <span className={cn('text-nt-600', stage ? 'text-[0.8125rem]' : 'text-[0.625rem]')}>
          No picture
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn('@container overflow-hidden rounded-[0.25rem] bg-gradient-to-br', tone.wash, box)}
    >
      {frame.image !== undefined && (
        <>
          <img
            src={frame.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-nt-950/92 via-nt-950/45 to-nt-950/20"
            aria-hidden="true"
          />
        </>
      )}

      <div
        className="dx-grid-texture pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
      />

      <div className="relative flex h-full w-full flex-col p-[5cqw]">
        <p
          className={cn(
            'font-medium uppercase tracking-[0.16em] text-[clamp(0.3125rem,2.4cqw,0.6875rem)]',
            tone.eyebrow,
          )}
        >
          {frame.eyebrow}
        </p>

        <p className="mt-auto text-balance font-medium leading-[1.12] tracking-[-0.03em] text-nt-0 text-[clamp(0.5rem,8.4cqw,1.875rem)]">
          {frame.headline}
        </p>

        <span
          className={cn('mt-[2cqw] block h-[1cqw] w-[9cqw] shrink-0 rounded-full', tone.rule)}
          aria-hidden="true"
        />

        {frame.lines.length > 0 && (
          <ul className="mt-[2.5cqw] space-y-[1.2cqw] leading-snug text-nt-0/75 text-[clamp(0.3125rem,3.2cqw,0.8125rem)]">
            {frame.lines.slice(0, stage ? 4 : 2).map((line) => (
              <li key={line} className="truncate">
                {line}
              </li>
            ))}
          </ul>
        )}

        {frame.footnote !== undefined && stage && (
          <p className="mt-[3cqw] text-nt-0/50 text-[clamp(0.3125rem,2.8cqw,0.75rem)]">
            {frame.footnote}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-nt-0/15" aria-hidden="true">
          <span
            className={cn('block h-full transition-[width] duration-1000 ease-linear', tone.rule)}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}
