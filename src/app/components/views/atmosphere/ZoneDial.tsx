import { useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '../../ui/utils';
import {
  CEILING_TARGET,
  COMFORT_HIGH,
  COMFORT_LOW,
  FLOOR_TARGET,
  STEP,
  clampTarget,
} from '../../../lib/climate';

const CENTRE = 120;
const RADIUS = 94;
const START = 135;
const SWEEP = 270;
const SPAN = CEILING_TARGET - FLOOR_TARGET;

const angleFor = (value: number): number => START + ((value - FLOOR_TARGET) / SPAN) * SWEEP;

const pointOn = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180;
  return { x: CENTRE + radius * Math.cos(radians), y: CENTRE + radius * Math.sin(radians) };
};

const arcPath = (from: number, to: number, radius: number): string => {
  const a = pointOn(from, radius);
  const b = pointOn(to, radius);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${Math.abs(to - from) > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
};

const valueAt = (x: number, y: number): number => {
  const degrees = (Math.atan2(y - CENTRE, x - CENTRE) * 180) / Math.PI;
  const offset = (degrees - START + 720) % 360;
  if (offset > SWEEP) return offset > SWEEP + (360 - SWEEP) / 2 ? FLOOR_TARGET : CEILING_TARGET;
  return clampTarget(FLOOR_TARGET + (offset / SWEEP) * SPAN);
};

interface ZoneDialProps {
  temp: number;
  target: number;
  locked: boolean;
  arriving?: string;
  onChange: (target: number) => void;
  onCommit: (target: number) => void;
}

export function ZoneDial({ temp, target, locked, arriving, onChange, onCommit }: ZoneDialProps) {
  const surface = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pending = useRef(false);
  const latest = useRef(target);

  if (!pending.current) latest.current = target;

  const shown = Math.min(CEILING_TARGET, Math.max(FLOOR_TARGET, temp));
  const targetAngle = angleFor(target);
  const tempAngle = angleFor(shown);
  const handle = pointOn(targetAngle, RADIUS);
  const marker = pointOn(tempAngle, RADIUS);
  const travelling = Math.abs(temp - target) >= 0.15;

  const moveTo = (to: number) => {
    latest.current = to;
    pending.current = true;
    onChange(to);
  };

  const commit = () => {
    if (!pending.current) return;
    pending.current = false;
    onCommit(latest.current);
  };

  const readAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = surface.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width) * 240;
    const y = ((event.clientY - box.top) / box.height) * 240;
    moveTo(valueAt(x, y));
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    readAt(event);
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    readAt(event);
  };

  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!dragging.current) return;
    dragging.current = false;
    commit();
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    const by = { ArrowUp: STEP, ArrowRight: STEP, ArrowDown: -STEP, ArrowLeft: -STEP }[event.key];
    if (by !== undefined) {
      event.preventDefault();
      moveTo(clampTarget(latest.current + by));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      moveTo(FLOOR_TARGET);
    }
    if (event.key === 'End') {
      event.preventDefault();
      moveTo(CEILING_TARGET);
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      moveTo(clampTarget(latest.current + 1));
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      moveTo(clampTarget(latest.current - 1));
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commit();
    }
  };

  return (
    <div
      ref={surface}
      role="slider"
      tabIndex={locked ? -1 : 0}
      aria-label="Temperature you want"
      aria-valuemin={FLOOR_TARGET}
      aria-valuemax={CEILING_TARGET}
      aria-valuenow={target}
      aria-valuetext={`Set to ${target.toFixed(1)} degrees, room is at ${temp.toFixed(1)}`}
      aria-disabled={locked}
      data-locked={locked ? 'true' : 'false'}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      onBlur={commit}
      className={cn(
        'relative mx-auto w-full max-w-[17rem] touch-none select-none rounded-full',
        locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
      )}
    >
      <svg viewBox="0 0 240 240" className="w-full" aria-hidden="true">
        <path
          d={arcPath(START, START + SWEEP, RADIUS)}
          fill="none"
          strokeWidth={13}
          strokeLinecap="round"
          className="stroke-nt-100"
        />
        <path
          d={arcPath(angleFor(COMFORT_LOW), angleFor(COMFORT_HIGH), RADIUS + 16)}
          fill="none"
          strokeWidth={3.5}
          strokeLinecap="round"
          className="stroke-grn-400"
        />
        <path
          d={arcPath(START, targetAngle, RADIUS)}
          fill="none"
          strokeWidth={13}
          strokeLinecap="round"
          className={cn('transition-all duration-[240ms]', locked ? 'stroke-nt-300' : 'stroke-brand-600')}
        />

        {travelling && (
          <path
            d={arcPath(Math.min(tempAngle, targetAngle), Math.max(tempAngle, targetAngle), RADIUS)}
            fill="none"
            strokeWidth={13}
            strokeLinecap="butt"
            strokeDasharray="2 7"
            className="stroke-brand-300 motion-safe:animate-pulse"
          />
        )}

        {Array.from({ length: SPAN + 1 }, (_, index) => {
          const value = FLOOR_TARGET + index;
          const outer = pointOn(angleFor(value), RADIUS - 11);
          const inner = pointOn(angleFor(value), RADIUS - 16);
          return (
            <line
              key={value}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              strokeWidth={1.5}
              strokeLinecap="round"
              className="stroke-nt-300"
            />
          );
        })}

        <circle cx={marker.x} cy={marker.y} r={5.5} className="fill-nt-0" />
        <circle
          cx={marker.x}
          cy={marker.y}
          r={4}
          className={cn(
            temp < COMFORT_LOW || temp > COMFORT_HIGH ? 'fill-warning' : 'fill-grn-600',
          )}
        />

        <circle
          cx={handle.x}
          cy={handle.y}
          r={11}
          className={cn(
            'transition-all duration-[240ms]',
            locked ? 'fill-nt-300' : 'fill-brand-600',
          )}
        />
        <circle
          cx={handle.x}
          cy={handle.y}
          r={4.5}
          className="fill-nt-0 transition-all duration-[240ms]"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-[2.75rem] font-medium leading-none tracking-[-0.04em] text-ink">
            {temp.toFixed(1)}
            <span className="text-[1.5rem] align-top text-ink-muted">°</span>
          </p>
          <p className="mt-1.5 text-[0.75rem] text-ink-muted">
            {locked ? 'Set to' : 'You want'} {target.toFixed(1)}°
          </p>
          {locked ? (
            <p className="mt-1.5 inline-flex items-center gap-1 text-[0.6875rem] text-ink-subtle">
              <Lock size={10} aria-hidden="true" />
              Read only
            </p>
          ) : (
            arriving !== undefined && (
              <p className="mt-1.5 text-[0.6875rem] text-brand-700">{arriving}</p>
            )
          )}
        </div>
      </div>

      <span className="pointer-events-none absolute bottom-[0.9rem] left-[1.6rem] text-[0.625rem] text-ink-subtle">
        {FLOOR_TARGET}°
      </span>
      <span className="pointer-events-none absolute bottom-[0.9rem] right-[1.6rem] text-[0.625rem] text-ink-subtle">
        {CEILING_TARGET}°
      </span>
    </div>
  );
}
