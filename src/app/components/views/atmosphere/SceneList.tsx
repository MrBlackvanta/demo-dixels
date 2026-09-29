import { Copy, Pencil, Play, Trash2, Users } from 'lucide-react';
import { cn } from '../../ui/utils';
import { FAN_LABEL, MODE_LABEL, SIGN_LABEL, warmthLabel } from '../../../lib/climate';
import type { Scene, Space, Zone } from '../../../lib/data';
import { glyphIcon } from './comfort';

interface SceneListProps {
  scenes: Scene[];
  zone?: Zone;
  space?: Space;
  me: string;
  locked: boolean;
  onApply: (scene: Scene) => void;
  onEdit: (scene: Scene) => void;
  onCopy: (scene: Scene) => void;
  onDelete: (scene: Scene) => void;
}

export function SceneList({
  scenes,
  zone,
  space,
  me,
  locked,
  onApply,
  onEdit,
  onCopy,
  onDelete,
}: SceneListProps) {
  return (
    <ul className="grid gap-3 px-4 py-5 lg:grid-cols-2">
      {scenes.map((scene) => {
        const Icon = glyphIcon(scene.glyph);
        const mine = scene.owner === me;

        return (
          <li key={scene.id} className="rounded-lg border border-line bg-nt-0 p-4">
            <div className="mb-3 flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700">
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[0.9375rem] font-medium text-ink">{scene.name}</h4>
                  {scene.builtIn && (
                    <span className="rounded-full bg-nt-100 px-2 py-0.5 text-[0.625rem] text-ink-muted">
                      Built in
                    </span>
                  )}
                  {scene.shared && !scene.builtIn && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-grn-50 px-2 py-0.5 text-[0.625rem] text-grn-700">
                      <Users size={9} aria-hidden="true" />
                      Shared
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">{scene.summary}</p>
              </div>
            </div>

            <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-y border-line py-3 text-[0.75rem] sm:grid-cols-3">
              {[
                ['Temperature', `${scene.target.toFixed(1)}°`],
                ['Air', `${MODE_LABEL[scene.mode]} · fan ${FAN_LABEL[scene.fan].toLowerCase()}`],
                ['Lights', `${scene.lights}% · ${warmthLabel(scene.warmth).toLowerCase()}`],
                ['Blinds', scene.blinds === 0 ? 'Shut' : `${scene.blinds}% open`],
                ['Sign', SIGN_LABEL[scene.sign]],
                ['Used', `${scene.uses} times`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-ink-subtle">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={locked || zone === undefined}
                onClick={() => zone && onApply(scene)}
                className="dx-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={13} aria-hidden="true" />
                {space ? `Run in ${space.name}` : 'Run it'}
              </button>

              <button type="button" onClick={() => onCopy(scene)} className="dx-btn-ghost">
                <Copy size={13} aria-hidden="true" />
                Duplicate
              </button>

              {mine && (
                <>
                  <button type="button" onClick={() => onEdit(scene)} className="dx-btn-ghost">
                    <Pencil size={13} aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(scene)}
                    className={cn('dx-btn-ghost text-danger')}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Delete
                  </button>
                </>
              )}

              {!mine && (
                <span className="text-[0.6875rem] text-ink-subtle">Kept by {scene.owner}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
