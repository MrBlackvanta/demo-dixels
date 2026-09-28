import { Star } from 'lucide-react';
import { cn } from '../ui/utils';

const SCORES = [1, 2, 3, 4, 5];

interface RatingProps {
  value?: number;
  onRate?: (score: number) => void;
}

export function Rating({ value, onRate }: RatingProps) {
  if (!onRate) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
        {SCORES.map((score) => (
          <Star
            key={score}
            size={13}
            aria-hidden="true"
            className={cn(
              score <= (value ?? 0) ? 'fill-current text-warning' : 'text-line-strong',
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onRate(score)}
          aria-label={`Rate ${score} out of 5`}
          className="rounded-sm p-0.5 transition-transform duration-[150ms] hover:scale-125"
        >
          <Star
            size={17}
            aria-hidden="true"
            className={cn(
              score <= (value ?? 0) ? 'fill-current text-warning' : 'text-line-strong',
            )}
          />
        </button>
      ))}
    </div>
  );
}
