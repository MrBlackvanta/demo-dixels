import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, ListVideo, Plus, Sparkles, Wand2, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { useCollection } from '../../../lib/store';
import {
  CURRENT_USER,
  bookings as bookingsCol,
  canvases as canvasesCol,
  channels as channelsCol,
  closures as closuresCol,
  entries as entriesCol,
  events as eventsCol,
  places as placesCol,
  screens as screensCol,
  signRules as signRulesCol,
  spaces as spacesCol,
  visits as visitsCol,
  zones as zonesCol,
} from '../../../lib/data';
import { toClock } from '../../../lib/format';
import { nowMinutes } from '../../../lib/agenda';
import { LEVELS } from '../../../lib/wayfinding';
import type { Canvas, Channel, Screen, SignRule } from '../../../lib/data';
import { CanvasDialog, blankCanvas, draftFromCanvas } from './CanvasDialog';
import type { CanvasDraft } from './CanvasDialog';
import { CanvasLibrary } from './CanvasLibrary';
import { ChannelPanel } from './ChannelPanel';
import { RuleList } from './RuleList';
import { ScreenCard } from './ScreenCard';
import { ScreenDialog, blankScreen } from './ScreenDialog';
import type { ScreenDraft } from './ScreenDialog';
import { StageRail } from './StageRail';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { onAirNow, paint, playingAt, readsLive } from './paint';
import type { Board } from './paint';

const TICK_MS = 1000;

const LENSES: Lens[] = [
  { id: 'wall', label: 'The wall', icon: LayoutGrid },
  { id: 'channels', label: 'Channels', icon: ListVideo },
  { id: 'library', label: 'Library', icon: Sparkles },
  { id: 'rules', label: 'Rules', icon: Wand2 },
];

const phaseOf = (id: string): number =>
  [...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);

export function LiveCanvas() {
  const screens = useCollection(screensCol);
  const canvases = useCollection(canvasesCol);
  const channels = useCollection(channelsCol);
  const rules = useCollection(signRulesCol);
  const spaces = useCollection(spacesCol);
  const bookings = useCollection(bookingsCol);
  const visits = useCollection(visitsCol);
  const events = useCollection(eventsCol);
  const zones = useCollection(zonesCol);
  const closures = useCollection(closuresCol);
  const places = useCollection(placesCol);
  const entries = useCollection(entriesCol);

  const [lens, setLens] = useState('wall');
  const [pickedScreen, setPickedScreen] = useState<string | null>(null);
  const [pickedChannel, setPickedChannel] = useState<string | null>(null);
  const [skips, setSkips] = useState<Record<string, number>>({});
  const [takeovers, setTakeovers] = useState<Record<string, { canvasId: string; until: number }>>({});
  const [canvasDraft, setCanvasDraft] = useState<{ draft: CanvasDraft; id?: string } | null>(null);
  const [screenDraft, setScreenDraft] = useState<{ draft: ScreenDraft } | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((count) => count + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const board: Board = useMemo(
    () => ({ spaces, bookings, visits, events, zones, closures, entries }),
    [spaces, bookings, visits, events, zones, closures, entries],
  );

  const canvasById = useMemo(
    () => new Map(canvases.map((canvas) => [canvas.id, canvas])),
    [canvases],
  );

  const channelById = useMemo(
    () => new Map(channels.map((channel) => [channel.id, channel])),
    [channels],
  );

  const screen = screens.find((row) => row.id === pickedScreen) ?? screens[0];

  const clock = nowMinutes();

  const reelFor = (row: Screen): Canvas[] => {
    const channel = channelById.get(row.channelId);
    if (channel === undefined) return [];
    return channel.canvasIds
      .map((id) => canvasById.get(id))
      .filter((canvas): canvas is Canvas => canvas !== undefined);
  };

  const frameFor = (row: Screen) => {
    const held = takeovers[row.id];
    const heldCanvas = held !== undefined && held.until > clock ? canvasById.get(held.canvasId) : undefined;
    if (heldCanvas !== undefined) {
      return { canvas: heldCanvas, progress: 0, secondsLeft: heldCanvas.seconds, queue: [] as Canvas[] };
    }

    const reel = reelFor(row);
    if (reel.length === 0) {
      return { canvas: undefined, progress: 0, secondsLeft: 0, queue: [] as Canvas[] };
    }

    const durations = reel.map((canvas) => canvas.seconds);
    const elapsed = seconds + phaseOf(row.id) + (skips[row.id] ?? 0);
    const { index, into } = playingAt(durations, elapsed);
    const current = reel[index];

    return {
      canvas: current,
      progress: into / current.seconds,
      secondsLeft: Math.max(0, Math.ceil(current.seconds - into)),
      queue: [...reel.slice(index + 1), ...reel.slice(0, index)],
    };
  };

  const onAir = useMemo(
    () =>
      screens.filter((row) => {
        const channel = channelById.get(row.channelId);
        return row.status === 'live' && channel !== undefined && onAirNow(channel);
      }).length,
    [screens, channelById],
  );

  const stats = [
    { label: 'Screens on the network', value: screens.length, tone: 'neutral' as const },
    { label: 'Playing right now', value: onAir, tone: 'brand' as const },
    {
      label: 'Not answering',
      value: screens.filter((row) => row.status === 'dark').length,
      tone: 'warning' as const,
    },
    {
      label: 'Canvases that update themselves',
      value: canvases.filter(readsLive).length,
      tone: 'neutral' as const,
    },
  ];

  const byLevel = useMemo(
    () =>
      LEVELS.map((level) => ({
        level,
        rows: screens.filter((row) => row.level === level),
      })).filter((group) => group.rows.length > 0),
    [screens],
  );

  const heading =
    lens === 'wall'
      ? `${screens.length} screens across ${byLevel.length} floors`
      : lens === 'channels'
        ? `${channels.length} channels`
        : lens === 'library'
          ? `${canvases.length} canvases`
          : `${rules.filter((rule) => rule.active).length} of ${rules.length} rules armed`;

  const skipAhead = () => {
    const { secondsLeft } = frameFor(screen);
    setSkips((current) => ({ ...current, [screen.id]: (current[screen.id] ?? 0) + secondsLeft }));
  };

  const toggleRest = () => {
    const next = screen.status === 'resting' ? 'live' : 'resting';
    screensCol.update(screen.id, { status: next, syncedAt: new Date().toISOString() });
    toast.success(
      next === 'live' ? `${screen.name} is awake` : `${screen.name} is resting`,
      { description: next === 'live' ? 'Back on its channel from the top.' : 'It will wake with its channel tomorrow.' },
    );
  };

  const fireRule = (rule: SignRule) => {
    const canvas = canvasById.get(rule.canvasId);
    if (canvas === undefined) return;

    const until = clock + rule.holdMinutes;
    setTakeovers((current) => ({
      ...current,
      ...Object.fromEntries(rule.screenIds.map((id) => [id, { canvasId: rule.canvasId, until }])),
    }));
    signRulesCol.update(rule.id, {
      firedAt: new Date().toISOString(),
      firedFor: `Tried by ${CURRENT_USER.name}`,
    });

    const hit = rule.screenIds.length;
    setPickedScreen(rule.screenIds[0] ?? null);
    setLens('wall');
    toast.success(`${canvas.title} took over ${hit} ${hit === 1 ? 'screen' : 'screens'}`, {
      description: `Back to their channels at ${toClock(until)}.`,
    });
  };

  const toggleRule = (rule: SignRule) => {
    signRulesCol.update(rule.id, { active: !rule.active });
    toast.success(rule.active ? `${rule.name} is paused` : `${rule.name} is armed`);
  };

  const moveCanvas = (channel: Channel, from: number, to: number) => {
    const next = [...channel.canvasIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    channelsCol.update(channel.id, { canvasIds: next });
  };

  const dropCanvas = (channel: Channel, canvasId: string) => {
    channelsCol.update(channel.id, {
      canvasIds: channel.canvasIds.filter((id) => id !== canvasId),
    });
    toast.success(`Off ${channel.name}`, {
      description: `${canvasById.get(canvasId)?.title ?? 'That canvas'} still lives in the library.`,
    });
  };

  const addCanvas = (channel: Channel, canvasId: string) => {
    channelsCol.update(channel.id, { canvasIds: [...channel.canvasIds, canvasId] });
  };

  const saveCanvas = (draft: CanvasDraft) => {
    const patch = {
      title: draft.title,
      source: draft.source,
      tone: draft.tone,
      seconds: draft.seconds,
      updatedBy: CURRENT_USER.name,
      headline: draft.headline === '' ? undefined : draft.headline,
      body: draft.body === '' ? undefined : draft.body,
      footnote: draft.footnote === '' ? undefined : draft.footnote,
      entryId: draft.entryId,
    };

    if (canvasDraft?.id === undefined) {
      canvasesCol.create(patch);
      toast.success(`${draft.title} is in the library`, {
        description: 'Add it to a channel and it starts playing.',
      });
    } else {
      canvasesCol.update(canvasDraft.id, patch);
      toast.success(`${draft.title} updated`, {
        description: 'Every screen showing it picks the change up on its next loop.',
      });
    }
    setCanvasDraft(null);
  };

  const saveScreen = (draft: ScreenDraft) => {
    const created = screensCol.create({
      name: draft.name,
      level: draft.level,
      shape: draft.shape,
      status: 'live',
      channelId: draft.channelId,
      syncedAt: new Date().toISOString(),
      brightness: draft.brightness,
      placeId: draft.placeId === '' ? undefined : draft.placeId,
    });
    setPickedScreen(created.id);
    setScreenDraft(null);
    toast.success(`${draft.name} is on the network`, {
      description: `Playing ${channelById.get(draft.channelId)?.name ?? 'its channel'} from now.`,
    });
  };

  const stage = frameFor(screen);
  const held = takeovers[screen.id];

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">LiveCanvas · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">Every screen, saying the right thing right now</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              Screens here are not slideshows. A canvas reads the same data the rest of Dixels runs
              on, so the menu, the room, the guest list and the closures are right without anyone
              editing anything.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCanvasDraft({ draft: blankCanvas() })}
              className="dx-btn-secondary"
            >
              <Sparkles size={15} aria-hidden="true" />
              New canvas
            </button>
            <button
              type="button"
              onClick={() => setScreenDraft({ draft: blankScreen(channels[0]?.id ?? '') })}
              className="dx-btn-primary"
            >
              <Plus size={15} aria-hidden="true" />
              Add a screen
            </button>
          </div>
        </div>

        <section
          aria-label="The network at a glance"
          className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="dx-card px-5 py-4">
              <CountUp
                value={stat.value}
                className={cn(
                  'block text-[2rem] font-medium leading-none tracking-[-0.035em]',
                  stat.tone === 'brand' && 'text-brand-600',
                  stat.tone === 'warning' && stat.value > 0 && 'text-warning',
                  stat.tone === 'warning' && stat.value === 0 && 'text-ink',
                  stat.tone === 'neutral' && 'text-ink',
                )}
              />
              <p className="mt-2 text-[0.75rem] text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
          <div className="min-w-0 space-y-5">
            <section aria-labelledby="livecanvas-heading" className="dx-card overflow-hidden">
              <h3 id="livecanvas-heading" className="sr-only">
                The screen network
              </h3>

              <Toolbar lenses={LENSES} lens={lens} onLens={setLens} heading={heading} />

              {lens === 'wall' && (
                <div className="space-y-5 px-4 py-4">
                  {byLevel.map((group) => (
                    <div key={group.level}>
                      <p className="dx-eyebrow mb-2.5">{group.level}</p>
                      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {group.rows.map((row) => {
                          const frame = frameFor(row);
                          if (frame.canvas === undefined) return null;
                          return (
                            <li key={row.id}>
                              <ScreenCard
                                screen={row}
                                frame={paint(frame.canvas, board, row)}
                                channelName={channelById.get(row.channelId)?.name ?? 'No channel'}
                                progress={frame.progress}
                                selected={row.id === screen?.id}
                                takenOver={
                                  takeovers[row.id] !== undefined && takeovers[row.id].until > clock
                                }
                                onSelect={() => setPickedScreen(row.id)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {lens === 'channels' && (
                <ChannelPanel
                  channels={channels}
                  canvases={canvases}
                  screens={screens}
                  selectedId={pickedChannel ?? channels[0]?.id ?? ''}
                  onSelect={setPickedChannel}
                  onMove={moveCanvas}
                  onDrop={dropCanvas}
                  onAdd={addCanvas}
                  onSeconds={(canvas, next) => canvasesCol.update(canvas.id, { seconds: next })}
                  onDays={(channel, days) => channelsCol.update(channel.id, { days })}
                  onWindow={(channel, patch) => channelsCol.update(channel.id, patch)}
                />
              )}

              {lens === 'library' && (
                <CanvasLibrary
                  canvases={canvases}
                  channels={channels}
                  board={board}
                  onEdit={(canvas) =>
                    setCanvasDraft({ draft: draftFromCanvas(canvas), id: canvas.id })
                  }
                />
              )}

              {lens === 'rules' && (
                <RuleList
                  rules={rules}
                  canvases={canvases}
                  screens={screens}
                  onToggle={toggleRule}
                  onFire={fireRule}
                />
              )}
            </section>
          </div>

          <aside className="space-y-5">
            {screen !== undefined && stage.canvas !== undefined && (
              <StageRail
                screen={screen}
                channel={channelById.get(screen.channelId)}
                frame={paint(stage.canvas, board, screen)}
                canvas={stage.canvas}
                queue={stage.queue}
                progress={stage.progress}
                secondsLeft={stage.secondsLeft}
                takeover={
                  held !== undefined && held.until > clock
                    ? {
                        canvas: canvasById.get(held.canvasId)!,
                        until: toClock(held.until),
                      }
                    : undefined
                }
                onSkip={skipAhead}
                onToggleRest={toggleRest}
                onBrightness={(value) => screensCol.update(screen.id, { brightness: value })}
                onClearTakeover={() =>
                  setTakeovers((current) => {
                    const next = { ...current };
                    delete next[screen.id];
                    return next;
                  })
                }
              />
            )}

            <div className="dx-card px-4 py-4">
              <p className="dx-eyebrow mb-2 flex items-center gap-1.5">
                <Zap size={12} aria-hidden="true" />
                Why this stays right
              </p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                {canvases.filter(readsLive).length} of {canvases.length} canvases read another
                product directly. Nobody retypes the menu at 07:00, a room panel is never wrong
                about the meeting behind the door, and a notice says whatever Content says it says.
              </p>
              <p className="mt-2.5 text-[0.75rem] text-ink-subtle">
                It is {toClock(clock)}. Nothing here was typed twice.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {canvasDraft !== null && (
        <CanvasDialog
          initial={canvasDraft.draft}
          editingId={canvasDraft.id}
          board={board}
          onClose={() => setCanvasDraft(null)}
          onSave={saveCanvas}
        />
      )}

      {screenDraft !== null && (
        <ScreenDialog
          initial={screenDraft.draft}
          channels={channels}
          places={places}
          onClose={() => setScreenDraft(null)}
          onSave={saveScreen}
        />
      )}
    </div>
  );
}
