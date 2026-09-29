import { Check } from 'lucide-react';
import { cn } from '../../ui/utils';
import { sceneChanges } from '../../../lib/climate';
import type { Scene, Zone } from '../../../lib/data';
import { glyphIcon } from './comfort';

interface SceneStripProps {
  scenes: Scene[];
  zone: Zone;
  locked: boolean;
  onApply: (scene: Scene) => void;
}

export function SceneStrip({ scenes, zone, locked, onApply }: SceneStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {scenes.map((scene) => {
        const Icon = glyphIcon(scene.glyph);
        const live = sceneChanges(zone, scene).length === 0;
        return (
          <button
            key={scene.id}
            type="button"
            disabled={locked}
            aria-pressed={live}
            onClick={() => onApply(scene)}
            className={cn(
              'group flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-[180ms]',
              live
                ? 'border-brand-600 bg-brand-50'
                : 'border-line bg-nt-0 hover:-translate-y-px hover:border-brand-300 hover:shadow-raise',
              locked && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none',
            )}
          >
            <span
              className={cn(
                'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md',
                live ? 'bg-brand-600 text-nt-0' : 'bg-nt-100 text-ink-muted',
              )}
            >
              {live ? <Check size={14} aria-hidden="true" /> : <Icon size={14} aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block truncate text-[0.8125rem] font-medium',
                  live ? 'text-brand-700' : 'text-ink',
                )}
              >
                {scene.name}
              </span>
              <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
                {live ? 'Running now' : `${scene.target.toFixed(1)}° · lights ${scene.lights}%`}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
