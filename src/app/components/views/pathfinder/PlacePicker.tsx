import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../ui/utils';
import { KIND_LABEL } from '../../../lib/wayfinding';
import { KIND_ICON, searchPlaces } from './wayfind';
import type { Place } from '../../../lib/data';

interface PlacePickerProps {
  id: string;
  label: string;
  places: Place[];
  value?: Place;
  placeholder: string;
  onPick: (place: Place) => void;
}

export function PlacePicker({ id, label, places, value, placeholder, onPick }: PlacePickerProps) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const hits = searchPlaces(places, term);

  useEffect(() => {
    if (!open) return;
    const onAway = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as globalThis.Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onAway);
    return () => document.removeEventListener('mousedown', onAway);
  }, [open]);

  const choose = (place: Place) => {
    onPick(place);
    setTerm('');
    setOpen(false);
    setCursor(0);
  };

  return (
    <div ref={box} className="relative">
      <label htmlFor={id} className="dx-eyebrow mb-1.5 block">
        {label}
      </label>

      <div className="relative">
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open && hits.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={
            open && hits[cursor] ? `${id}-option-${hits[cursor].id}` : undefined
          }
          value={open ? term : (value?.name ?? '')}
          placeholder={placeholder}
          onFocus={() => {
            setTerm('');
            setOpen(true);
          }}
          onChange={(event) => {
            setTerm(event.target.value);
            setCursor(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setCursor((at) => Math.min(hits.length - 1, at + 1));
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setCursor((at) => Math.max(0, at - 1));
              return;
            }
            if (event.key === 'Enter' && hits[cursor]) {
              event.preventDefault();
              choose(hits[cursor]);
              return;
            }
            if (event.key === 'Escape') setOpen(false);
          }}
          className="dx-field pl-8 pr-8"
        />
        {value !== undefined && !open && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6875rem] text-ink-subtle">
            {value.level}
          </span>
        )}
        {open && term !== '' && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setTerm('')}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-ink-subtle hover:text-ink"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && hits.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="dx-card absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto p-1 shadow-lg"
        >
          {hits.map((place, index) => {
            const Icon = KIND_ICON[place.kind];
            return (
              <li key={place.id}>
                <button
                  type="button"
                  id={`${id}-option-${place.id}`}
                  role="option"
                  aria-selected={index === cursor}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => choose(place)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-[140ms]',
                    index === cursor ? 'bg-nt-50' : 'hover:bg-nt-50',
                  )}
                >
                  <Icon size={14} aria-hidden="true" className="shrink-0 text-ink-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] text-ink">{place.name}</span>
                    <span className="block truncate text-[0.6875rem] text-ink-subtle">
                      {KIND_LABEL[place.kind]} · {place.level}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
