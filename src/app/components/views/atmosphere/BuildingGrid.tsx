import { inComfortBand } from '../../../lib/climate';
import type { Standing } from '../../../lib/climate';
import { ZoneCard } from './ZoneCard';
import type { ZoneRow } from './comfort';

interface BuildingGridProps {
  rows: ZoneRow[];
  activeSpaceId: string;
  standingFor: (spaceId: string) => Standing;
  votersFor: (spaceId: string) => number;
  onOpen: (spaceId: string) => void;
}

export function BuildingGrid({
  rows,
  activeSpaceId,
  standingFor,
  votersFor,
  onOpen,
}: BuildingGridProps) {
  const levels = [...new Set(rows.map((row) => row.space.level))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  return (
    <div className="space-y-6 px-4 py-5">
      {levels.map((level) => {
        const onLevel = rows.filter((row) => row.space.level === level);
        const settled = onLevel.filter((row) => inComfortBand(row.zone.temp)).length;

        return (
          <section key={level} aria-labelledby={`level-${level.replace(/\s+/g, '-')}`}>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h4 id={`level-${level.replace(/\s+/g, '-')}`} className="dx-eyebrow">
                {level}
              </h4>
              <p className="text-[0.6875rem] text-ink-muted">
                {settled} of {onLevel.length} comfortable
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {onLevel.map((row) => (
                <ZoneCard
                  key={row.zone.id}
                  zone={row.zone}
                  space={row.space}
                  standing={standingFor(row.space.id)}
                  voters={votersFor(row.space.id)}
                  active={row.space.id === activeSpaceId}
                  onOpen={() => onOpen(row.space.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
