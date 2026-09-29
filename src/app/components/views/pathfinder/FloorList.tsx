import { Ban, Navigation, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../ui/utils';
import { KIND_LABEL, walkMinutes } from '../../../lib/wayfinding';
import type { Route } from '../../../lib/wayfinding';
import { KIND_ICON } from './wayfind';
import type { Place, Space } from '../../../lib/data';

export interface FloorRow {
  place: Place;
  space?: Space;
  route?: Route;
  closed?: string;
}

interface FloorListProps {
  rows: FloorRow[];
  selectedId?: string;
  onRoute: (place: Place) => void;
  onEdit: (place: Place) => void;
  onDelete: (place: Place) => void;
}

export function FloorList({ rows, selectedId, onRoute, onEdit, onDelete }: FloorListProps) {
  return (
    <ul className="divide-y divide-line">
      {rows.map(({ place, space, route, closed }) => {
        const Icon = KIND_ICON[place.kind];
        const editable = place.coreId === undefined;

        return (
          <li
            key={place.id}
            className={cn(
              'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5',
              place.id === selectedId && 'bg-brand-50/50',
            )}
          >
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-lg',
                closed !== undefined ? 'bg-nt-100 text-ink-subtle' : 'bg-brand-50 text-brand-700',
              )}
            >
              <Icon size={16} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate text-[0.875rem] font-medium text-ink">{place.name}</span>
                {!place.stepFree && (
                  <span className="dx-chip border-warning/40 text-warning">Steps only</span>
                )}
                {closed !== undefined && (
                  <span className="dx-chip border-line text-ink-subtle">
                    <Ban size={10} aria-hidden="true" />
                    Closed
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-[0.75rem] text-ink-subtle">
                {KIND_LABEL[place.kind]}
                {space !== undefined && ` · seats ${space.capacity} · ${space.utilisation}% used`}
                {closed !== undefined && ` · ${closed}`}
                {closed === undefined && place.hours !== undefined && ` · ${place.hours}`}
              </p>
            </div>

            {route?.found === true && (
              <p className="shrink-0 text-[0.75rem] tabular-nums text-ink-muted">
                {walkMinutes(route)} min away
              </p>
            )}

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onRoute(place)}
                aria-label={`Route to ${place.name}`}
                className="dx-btn-ghost"
              >
                <Navigation size={13} aria-hidden="true" />
              </button>
              {editable && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(place)}
                    aria-label={`Edit ${place.name}`}
                    className="dx-btn-ghost"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(place)}
                    aria-label={`Delete ${place.name}`}
                    className="dx-btn-ghost"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
