import type { ChangeEvent } from 'react';
import { Blinds, Lightbulb, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { FAN_LABEL, MODE_LABEL, MODE_SHORT, warmthLabel } from '../../../lib/climate';
import type { HvacMode, Zone } from '../../../lib/data';
import { MODE_ICON, MODES } from './comfort';

interface SliderProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: number;
  readout: string;
  min: number;
  max: number;
  step: number;
  locked: boolean;
  onChange: (value: number) => void;
}

function Slider({ id, icon: Icon, label, value, readout, min, max, step, locked, onChange }: SliderProps) {
  const handle = (event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[0.8125rem] text-ink">
          <Icon size={13} aria-hidden="true" className="text-ink-subtle" />
          {label}
        </label>
        <span className="text-[0.75rem] tabular-nums text-ink-muted">{readout}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={locked}
        onChange={handle}
        className={cn(
          'h-1.5 w-full appearance-none rounded-full bg-nt-100 accent-brand-600',
          locked && 'cursor-not-allowed opacity-50',
        )}
      />
    </div>
  );
}

interface ZoneControlsProps {
  zone: Zone;
  locked: boolean;
  onPatch: (patch: Partial<Zone>) => void;
}

export function ZoneControls({ zone, locked, onPatch }: ZoneControlsProps) {
  return (
    <div className="space-y-5">
      <fieldset disabled={locked}>
        <legend className="dx-eyebrow mb-2">Air</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {MODES.map((mode) => {
            const Icon = MODE_ICON[mode];
            const on = zone.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={on}
                aria-label={MODE_LABEL[mode]}
                onClick={() => onPatch({ mode: mode as HvacMode })}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-[0.6875rem] transition-all duration-[180ms]',
                  on
                    ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                    : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                  locked && 'cursor-not-allowed opacity-60',
                )}
              >
                <Icon size={14} aria-hidden="true" />
                {MODE_SHORT[mode]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={locked}>
        <legend className="dx-eyebrow mb-2">Fan</legend>
        <div className="flex gap-1.5">
          {FAN_LABEL.map((label, speed) => {
            const on = zone.fan === speed;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => onPatch({ fan: speed })}
                className={cn(
                  'flex-1 rounded-md border px-2 py-2 text-[0.75rem] transition-all duration-[180ms]',
                  on
                    ? 'border-brand-600 bg-brand-50 font-medium text-brand-700'
                    : 'border-line bg-nt-0 text-ink-muted hover:text-ink',
                  locked && 'cursor-not-allowed opacity-60',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-4">
        <Slider
          id="zone-lights"
          icon={Lightbulb}
          label="Lights"
          value={zone.lights}
          readout={zone.lights === 0 ? 'Off' : `${zone.lights}%`}
          min={0}
          max={100}
          step={5}
          locked={locked}
          onChange={(lights) => onPatch({ lights })}
        />
        <Slider
          id="zone-warmth"
          icon={Sun}
          label="Light warmth"
          value={zone.warmth}
          readout={`${warmthLabel(zone.warmth)} · ${zone.warmth}K`}
          min={2200}
          max={6000}
          step={100}
          locked={locked}
          onChange={(warmth) => onPatch({ warmth })}
        />
        <Slider
          id="zone-blinds"
          icon={Blinds}
          label="Blinds"
          value={zone.blinds}
          readout={zone.blinds === 0 ? 'Shut' : zone.blinds === 100 ? 'Wide open' : `${zone.blinds}% open`}
          min={0}
          max={100}
          step={5}
          locked={locked}
          onChange={(blinds) => onPatch({ blinds })}
        />
      </div>
    </div>
  );
}
