import { AlertTriangle, Droplets, Lock, MapPin, Sun, Users, Volume2, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';
import { money } from '../../../lib/format';
import {
  BASELINE,
  COMFORT_HIGH,
  COMFORT_LOW,
  MODE_LABEL,
  airOf,
  dailyCost,
  driftOf,
  humidityOk,
  minutesToTarget,
  readyAt,
  settled,
  tracking,
} from '../../../lib/climate';
import type { Consensus, Standing, Tally } from '../../../lib/climate';
import type { ComfortVerdict, Meeting, Scene, Space, Zone } from '../../../lib/data';
import { AIR_LABEL, AIR_TONE, people } from './comfort';
import { SceneStrip } from './SceneStrip';
import { VoteStrip } from './VoteStrip';
import { ZoneControls } from './ZoneControls';
import { ZoneDial } from './ZoneDial';

interface ReadingProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: string;
}

function Reading({ icon: Icon, label, value, tone }: ReadingProps) {
  return (
    <div className="rounded-lg border border-line px-3.5 py-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
        <Icon size={12} aria-hidden="true" className="text-ink-subtle" />
        {label}
      </p>
      <p className={cn('text-[0.9375rem] font-medium tabular-nums', tone ?? 'text-ink')}>{value}</p>
    </div>
  );
}

interface ZonePanelProps {
  space: Space;
  zone: Zone;
  standing: Standing;
  locked: boolean;
  clock: string;
  tally: Tally;
  mine?: ComfortVerdict;
  consensus: Consensus;
  scenes: Scene[];
  happening?: Meeting;
  onTarget: (target: number) => void;
  onCommitTarget: (target: number) => void;
  onPatch: (patch: Partial<Zone>) => void;
  onVote: (verdict: ComfortVerdict) => void;
  onNudge: (by: number) => void;
  onScene: (scene: Scene) => void;
  onReport: () => void;
}

export function ZonePanel({
  space,
  zone,
  standing,
  locked,
  clock,
  tally,
  mine,
  consensus,
  scenes,
  happening,
  onTarget,
  onCommitTarget,
  onPatch,
  onVote,
  onNudge,
  onScene,
  onReport,
}: ZonePanelProps) {
  const air = airOf(zone.co2);
  const drift = driftOf(zone);
  const arriving = !tracking(zone)
    ? 'Not getting there'
    : settled(zone)
      ? 'Holding steady'
      : `${zone.target.toFixed(1)}° by ${readyAt(zone, space, clock)}`;

  const swing = dailyCost(zone.target, space) - dailyCost(BASELINE, space);

  return (
    <section aria-labelledby="zone-heading" className="dx-card overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-nt-50 px-5 py-4">
        <div className="min-w-0">
          <h3 id="zone-heading" className="dx-h4 truncate">
            {space.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} aria-hidden="true" />
              {space.level} · {space.kind}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Users size={11} aria-hidden="true" />
              {zone.occupancy === 0 ? 'Empty' : people(zone.occupancy)}
            </span>
          </p>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem]',
            standing.authority === 'yours' && 'border-grn-300 bg-grn-50 text-grn-700',
            standing.authority === 'shared' && 'border-line-strong bg-nt-0 text-ink-muted',
            standing.authority === 'held' && 'border-warning/40 bg-warning-bg text-warning',
            standing.authority === 'offline' && 'border-line-strong bg-nt-100 text-ink-subtle',
          )}
        >
          {locked && <Lock size={10} aria-hidden="true" />}
          {standing.authority === 'yours'
            ? 'Yours to set'
            : standing.authority === 'shared'
              ? 'Nobody has it booked'
              : standing.authority === 'held'
                ? `${standing.holder?.organizer} has it`
                : 'Out of service'}
        </span>
      </header>

      {zone.fault !== undefined && (
        <p className="flex items-start gap-2 border-b border-danger/25 bg-danger-bg px-5 py-3 text-[0.8125rem] text-danger">
          <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          {zone.fault}
        </p>
      )}

      <p className="border-b border-line px-5 py-2.5 text-[0.75rem] text-ink-muted">
        {standing.reason}
      </p>

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-2">
        <div>
          <ZoneDial
            temp={zone.temp}
            target={zone.target}
            locked={locked}
            arriving={arriving}
            onChange={onTarget}
            onCommit={onCommitTarget}
          />

          <p className="mt-3 text-center text-[0.6875rem] text-ink-subtle">
            The green arc is the comfort band, {COMFORT_LOW}° to {COMFORT_HIGH}°.
          </p>

          <p className="mt-3 text-center text-[0.8125rem] text-ink-muted">
            {!tracking(zone)
              ? `${MODE_LABEL[zone.mode]} · stuck ${Math.abs(drift).toFixed(1)}° off while the fault stands`
              : settled(zone)
                ? `${MODE_LABEL[zone.mode]} · sitting where you asked`
                : `${MODE_LABEL[zone.mode]} · ${Math.abs(drift).toFixed(1)}° to go, about ${minutesToTarget(zone, space)} min`}
          </p>

          <p className="mt-1.5 text-center text-[0.75rem] text-ink-muted">
            {money(Math.round(dailyCost(zone.target, space)))} a day to hold this
            {Math.abs(Math.round(swing)) >= 1 && (
              <span className={cn('ml-1', swing > 0 ? 'text-warning' : 'text-grn-700')}>
                — {money(Math.abs(Math.round(swing)))} {swing > 0 ? 'more' : 'less'} than the
                building default
              </span>
            )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Reading
              icon={Wind}
              label="Air"
              value={`${AIR_LABEL[air]} · ${zone.co2}`}
              tone={AIR_TONE[air]}
            />
            <Reading
              icon={Droplets}
              label="Humidity"
              value={`${zone.humidity}%`}
              tone={humidityOk(zone.humidity) ? undefined : 'text-warning'}
            />
            <Reading icon={Volume2} label="Noise" value={`${zone.noise} dB`} />
            <Reading icon={Sun} label="Daylight" value={`${zone.lux} lx`} />
            <Reading icon={Users} label="In the room" value={String(zone.occupancy)} />
            <Reading icon={Lock} label="Set by" value={zone.setBy ?? 'Nobody yet'} />
          </div>
        </div>

        <div className="space-y-6">
          <ZoneControls zone={zone} locked={locked} onPatch={onPatch} />

          <div>
            <p className="dx-eyebrow mb-2">Set it all at once</p>
            <SceneStrip scenes={scenes} zone={zone} locked={locked} onApply={onScene} />
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-nt-50 px-5 py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="dx-eyebrow">How it feels in here</p>
          <button type="button" onClick={onReport} className="dx-btn-ghost">
            <AlertTriangle size={13} aria-hidden="true" />
            Something is wrong with this room
          </button>
        </div>

        <VoteStrip
          tally={tally}
          mine={mine}
          consensus={consensus}
          canNudge={!locked}
          onVote={onVote}
          onNudge={onNudge}
        />

        {happening && (
          <p className="mt-3 text-[0.75rem] text-ink-muted">
            {happening.title} is in here until {happening.end}.
          </p>
        )}
      </div>
    </section>
  );
}
