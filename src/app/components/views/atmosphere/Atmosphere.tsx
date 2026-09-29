import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, SearchX, SlidersHorizontal, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection, useScalar } from '../../../lib/store';
import {
  CURRENT_USER,
  bookings as bookingsCol,
  comfortVotes as votesCol,
  meetings as meetingsCol,
  orderDestination,
  rules as rulesCol,
  scenes as scenesCol,
  spaces as spacesCol,
  tickets as ticketsCol,
  zones as zonesCol,
} from '../../../lib/data';
import { todayKey, toClock, toMinutes } from '../../../lib/format';
import { dueFrom } from '../../../lib/sla';
import { isOnInvite, nowMinutes } from '../../../lib/agenda';
import {
  BASELINE,
  FAN_LABEL,
  MODE_LABEL,
  SIGN_LABEL,
  advanced,
  buildingCost,
  canControl,
  clampTarget,
  comfortOf,
  consensusOf,
  inComfortBand,
  leadFor,
  nowInRoom,
  sceneChanges,
  standingIn,
  startBy,
  settled,
  tallyOf,
  tallySize,
  tracking,
} from '../../../lib/climate';
import type { ComfortVerdict, Rule, Scene, Zone } from '../../../lib/data';
import { BuildingGrid } from './BuildingGrid';
import { ReportDialog, SYMPTOMS } from './ReportDialog';
import type { Symptom } from './ReportDialog';
import { RuleDialog, blankRule, draftFromRule } from './RuleDialog';
import type { RuleDraft } from './RuleDialog';
import { RuleList } from './RuleList';
import { SceneDialog, blankScene, draftFrom } from './SceneDialog';
import type { SceneDraft } from './SceneDialog';
import { SceneList } from './SceneList';
import { SignCard } from './SignCard';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { ZonePanel } from './ZonePanel';
import { ZoneRail } from './ZoneRail';
import type { Upcoming } from './ZoneRail';
import { NO_FILTERS, matchesFilters } from './comfort';
import type { Filters, ZoneRow } from './comfort';

const me = CURRENT_USER.name;
const FALLBACK_DESK = 'desk-4-118';
const TICK_MS = 10000;
const TICK_MINUTES = 0.4;

const LENSES: Lens[] = [
  { id: 'space', label: 'My space', icon: SlidersHorizontal },
  { id: 'building', label: 'Building', icon: Building2 },
  { id: 'scenes', label: 'Scenes', icon: Sparkles },
  { id: 'rules', label: 'Rules', icon: Wand2 },
];

export function Atmosphere() {
  const zones = useCollection(zonesCol);
  const spaces = useCollection(spacesCol);
  const bookings = useCollection(bookingsCol);
  const meetings = useCollection(meetingsCol);
  const votes = useCollection(votesCol);
  const scenes = useCollection(scenesCol);
  const rules = useCollection(rulesCol);
  const tickets = useCollection(ticketsCol);
  const [destination] = useScalar(orderDestination);

  const [lens, setLens] = useState('space');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [picked, setPicked] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [sceneDraft, setSceneDraft] = useState<{ draft: SceneDraft; id?: string } | null>(null);
  const [ruleDraft, setRuleDraft] = useState<{ draft: RuleDraft; id?: string } | null>(null);
  const [pulling, setPulling] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((count) => count + 1);
      const roster = new Map(spacesCol.all().map((space) => [space.id, space]));
      zonesCol.all().forEach((zone) => {
        const space = roster.get(zone.spaceId);
        if (space === undefined || !tracking(zone) || settled(zone)) return;
        const temp = advanced(zone, space, TICK_MINUTES);
        zonesCol.update(zone.id, { temp, trend: [...zone.trend.slice(1), temp] });
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const today = todayKey();
  const clock = toClock(nowMinutes());

  const myDesk = useMemo(
    () => spaces.find((space) => space.name === destination)?.id ?? FALLBACK_DESK,
    [spaces, destination],
  );

  const rows = useMemo<ZoneRow[]>(
    () =>
      zones.flatMap((zone) => {
        const space = spaces.find((row) => row.id === zone.spaceId);
        return space ? [{ zone, space }] : [];
      }),
    [zones, spaces],
  );

  const standingFor = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof standingIn>>();
    return (spaceId: string) => {
      const hit = cache.get(spaceId);
      if (hit) return hit;
      const space = spaces.find((row) => row.id === spaceId);
      const made = space
        ? standingIn(space, bookings, me, myDesk, today, clock)
        : { authority: 'offline' as const, reason: 'Unknown space.' };
      cache.set(spaceId, made);
      return made;
    };
  }, [spaces, bookings, myDesk, today, clock]);

  const whereIAm = useMemo(() => {
    const live = meetings.find(
      (meeting) =>
        meeting.date === today &&
        meeting.status !== 'cancelled' &&
        meeting.spaceId !== undefined &&
        isOnInvite(meeting, me) &&
        toMinutes(meeting.start) <= toMinutes(clock) &&
        toMinutes(meeting.end) > toMinutes(clock),
    );
    return live?.spaceId ?? myDesk;
  }, [meetings, today, clock, myDesk]);

  const activeId = picked ?? whereIAm;
  const found = rows.find((row) => row.space.id === activeId) ?? rows[0];
  const active =
    found === undefined || pulling === null
      ? found
      : { ...found, zone: { ...found.zone, target: pulling } };

  const tally = useMemo(
    () => (active ? tallyOf(votes, active.space.id) : undefined),
    [votes, active],
  );

  const consensus = useMemo(
    () => (tally ? consensusOf(tally) : { direction: 0 as const, people: [], nudge: 0 }),
    [tally],
  );

  const mine = useMemo(() => {
    if (!active) return undefined;
    const cutoff = Date.now() - 8 * 3_600_000;
    return [...votes]
      .filter(
        (vote) =>
          vote.spaceId === active.space.id &&
          vote.person === me &&
          new Date(vote.at).getTime() >= cutoff,
      )
      .sort((a, b) => b.at.localeCompare(a.at))[0]?.verdict;
  }, [votes, active]);

  const standing = active ? standingFor(active.space.id) : undefined;
  const locked = standing === undefined || !canControl(standing);

  const visible = useMemo(
    () =>
      rows.filter((row) =>
        matchesFilters(
          row,
          filters,
          comfortOf(row.zone.temp),
          standingFor(row.space.id).authority === 'held',
        ),
      ),
    [rows, filters, standingFor],
  );

  const levels = useMemo(
    () =>
      [...new Set(rows.map((row) => row.space.level))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    [rows],
  );

  const comfortable = rows.filter((row) => inComfortBand(row.zone.temp)).length;

  const flaggedToday = useMemo(() => {
    const cutoff = Date.now() - 8 * 3_600_000;
    return new Set(
      votes
        .filter(
          (vote) =>
            new Date(vote.at).getTime() >= cutoff &&
            (vote.verdict === 'cold' || vote.verdict === 'hot' || vote.verdict === 'warm'),
        )
        .map((vote) => vote.person),
    ).size;
  }, [votes]);

  const flagged = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            row.zone.fault !== undefined ||
            !inComfortBand(row.zone.temp) ||
            consensusOf(tallyOf(votes, row.space.id)).direction !== 0,
        )
        .sort((a, b) => {
          const byFault = Number(b.zone.fault !== undefined) - Number(a.zone.fault !== undefined);
          if (byFault !== 0) return byFault;
          return (
            Math.abs(b.zone.temp - BASELINE) - Math.abs(a.zone.temp - BASELINE)
          );
        }),
    [rows, votes],
  );

  const meetingScene = scenes.find((scene) => scene.id === 'sc-meeting') ?? scenes[0];

  const upcoming = useMemo<Upcoming | undefined>(() => {
    const next = meetings
      .filter(
        (meeting) =>
          meeting.date === today &&
          meeting.status !== 'cancelled' &&
          meeting.spaceId !== undefined &&
          isOnInvite(meeting, me) &&
          toMinutes(meeting.start) > toMinutes(clock),
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];

    if (next === undefined || meetingScene === undefined) return undefined;

    const row = rows.find((entry) => entry.space.id === next.spaceId);
    if (row === undefined) return undefined;

    const minutesAway = toMinutes(next.start) - toMinutes(clock);
    const lead = leadFor(row.zone, row.space, meetingScene.target);

    return {
      meeting: next,
      space: row.space,
      zone: row.zone,
      minutesAway,
      arrivingAt: advanced(row.zone, row.space, minutesAway),
      lead,
      wants: meetingScene.target,
      startBy: startBy(next, lead),
      canSet: canControl(standingFor(row.space.id)),
    };
  }, [meetings, today, clock, rows, meetingScene, standingFor]);

  const stats = [
    { label: 'Rooms sitting comfortable', value: comfortable, tone: 'brand' as const },
    {
      label: 'Outside the comfort band',
      value: rows.length - comfortable,
      tone: 'warning' as const,
    },
    { label: 'People who flagged a room', value: flaggedToday, tone: 'warning' as const },
    {
      label: 'Rules running for you',
      value: rules.filter((rule) => rule.active && rule.owner === me).length,
      tone: 'neutral' as const,
    },
  ];

  const refuse = () =>
    toast.error(`${found?.space.name ?? 'That room'} is not yours to set`, {
      description: standing?.reason,
    });

  const announce = (patch: Partial<Zone>): [string?, string?] => {
    const room = found?.space.name ?? 'The room';
    if (patch.mode !== undefined) return [`${room} is on ${MODE_LABEL[patch.mode].toLowerCase()}`];
    if (patch.fan !== undefined) return [`Fan set to ${FAN_LABEL[patch.fan].toLowerCase()}`];
    if (patch.sign !== undefined)
      return [`The door now says ${SIGN_LABEL[patch.sign].toLowerCase()}`];
    if (patch.signNote !== undefined) return ['The sign has changed', patch.signNote];
    return [];
  };

  const write = (patch: Partial<Zone>, message?: string, detail?: string) => {
    if (!found) return;
    if (locked) {
      refuse();
      return;
    }

    const kept = found.zone;
    const before = Object.fromEntries(
      Object.keys(patch).map((key) => [key, kept[key as keyof Zone]]),
    ) as Partial<Zone>;

    zonesCol.update(kept.id, { ...patch, setBy: me, setAt: new Date().toISOString() });

    if (message === undefined) return;
    toast.success(message, {
      description: detail,
      action: {
        label: 'Undo',
        onClick: () =>
          zonesCol.update(kept.id, { ...before, setBy: kept.setBy, setAt: kept.setAt }),
      },
    });
  };

  const others =
    found === undefined ? 0 : Math.max(0, found.zone.occupancy - (activeId === whereIAm ? 1 : 0));

  const commitTarget = (target: number) => {
    setPulling(null);
    if (!found || target === found.zone.target) return;

    write(
      { target },
      `${found.space.name} set to ${target.toFixed(1)}°`,
      others > 0
        ? `${others} other ${others === 1 ? 'person is' : 'people are'} in here, so this is their temperature too.`
        : `About ${leadFor(found.zone, found.space, target)} minutes to get there.`,
    );
  };

  const applyScene = (scene: Scene) => {
    if (!found) return;
    if (locked) {
      refuse();
      return;
    }

    const changes = sceneChanges(found.zone, scene);
    if (changes.length === 0) {
      toast.info(`${found.space.name} is already set like ${scene.name}`, {
        description: 'Nothing to change.',
      });
      return;
    }

    const before: Partial<Zone> = {
      target: found.zone.target,
      mode: found.zone.mode,
      fan: found.zone.fan,
      lights: found.zone.lights,
      warmth: found.zone.warmth,
      blinds: found.zone.blinds,
      sign: found.zone.sign,
      signNote: found.zone.signNote,
    };

    zonesCol.update(found.zone.id, {
      target: scene.target,
      mode: scene.mode,
      fan: scene.fan,
      lights: scene.lights,
      warmth: scene.warmth,
      blinds: scene.blinds,
      sign: scene.sign,
      signNote: scene.signNote,
      setBy: me,
      setAt: new Date().toISOString(),
    });
    scenesCol.update(scene.id, { uses: scene.uses + 1 });

    toast.success(`${scene.name} is running in ${found.space.name}`, {
      description: `${changes.length} ${changes.length === 1 ? 'thing' : 'things'} moved — ${changes
        .slice(0, 2)
        .map((change) => `${change.label.toLowerCase()} ${change.from} → ${change.to}`)
        .join(', ')}${changes.length > 2 ? '…' : '.'}`,
      action: {
        label: 'Undo',
        onClick: () => {
          zonesCol.update(found.zone.id, before);
          scenesCol.update(scene.id, { uses: scene.uses });
        },
      },
    });
  };

  const vote = (verdict: ComfortVerdict) => {
    if (!active) return;

    const made = votesCol.create({
      spaceId: active.space.id,
      person: me,
      verdict,
      at: new Date().toISOString(),
    });

    const after = consensusOf(
      tallyOf(
        [...votes, { spaceId: active.space.id, person: me, verdict, at: new Date().toISOString() }],
        active.space.id,
      ),
    );

    toast.success(
      verdict === 'right'
        ? `Noted — ${active.space.name} is working for you`
        : `Noted — ${active.space.name} is ${verdict === 'cold' || verdict === 'cool' ? 'cold' : 'warm'} for you`,
      {
        description:
          after.direction === 0
            ? 'Facilities see this against the room, not against you.'
            : `${after.people.length} people now agree, so the room is asking to move ${after.nudge > 0 ? 'up' : 'down'} ${Math.abs(after.nudge).toFixed(1)}°.`,
        action: { label: 'Undo', onClick: () => votesCol.remove(made.id) },
      },
    );
  };

  const nudge = (by: number) => {
    if (!found) return;
    const target = clampTarget(found.zone.target + by);
    write(
      { target },
      `${found.space.name} moved to ${target.toFixed(1)}°`,
      `Because ${consensus.people.slice(0, 3).join(', ')}${consensus.people.length > 3 ? ' and others' : ''} asked.`,
    );
  };

  const raise = (symptom: Symptom, detail: string) => {
    if (!active) return;

    const openedAt = new Date().toISOString();
    const highest = tickets.reduce(
      (top, row) => Math.max(top, Number(row.ref.slice(4)) || 0),
      1039,
    );

    const ticket = ticketsCol.create({
      ref: `RSV-${highest + 1}`,
      subject: `${symptom.label} — ${active.space.name}`,
      detail,
      category: symptom.category,
      team: 'Workplace',
      location: `${active.space.name} · ${active.space.level}`,
      priority: symptom.priority,
      status: 'open',
      requester: me,
      openedAt,
      dueAt: dueFrom(openedAt, symptom.priority),
      spaceId: active.space.id,
      thread: [
        { author: 'Resolve', body: `${me} raised this request`, at: openedAt, kind: 'event' },
        {
          author: 'Atmosphere',
          body: `Readings at the time: ${found?.zone.temp.toFixed(1)}° against a setpoint of ${found?.zone.target.toFixed(1)}°, ${active.zone.co2} ppm, ${active.zone.humidity}% humidity, ${active.zone.noise} dB.`,
          at: openedAt,
          kind: 'note',
        },
      ],
    });

    const verdict: ComfortVerdict =
      symptom.id === 'cold' ? 'cold' : symptom.id === 'hot' ? 'hot' : 'warm';

    const noted = votesCol.create({
      spaceId: active.space.id,
      person: me,
      verdict,
      at: openedAt,
      note: detail,
      ticketId: ticket.id,
    });

    setReporting(false);
    toast.success(`${ticket.ref} is with the Workplace team`, {
      description: `${active.space.name} — they have the readings, so nobody has to describe the room twice.`,
      action: {
        label: 'Undo',
        onClick: () => {
          ticketsCol.remove(ticket.id);
          votesCol.remove(noted.id);
        },
      },
    });
  };

  const saveScene = (draft: SceneDraft) => {
    const editing = sceneDraft?.id;

    if (editing !== undefined) {
      scenesCol.update(editing, { ...draft });
      setSceneDraft(null);
      toast.success(`${draft.name} saved`, {
        description: draft.shared ? 'Everyone can use it.' : 'Only you can see it.',
      });
      return;
    }

    const made = scenesCol.create({ ...draft, owner: me, builtIn: false, uses: 0 });
    setSceneDraft(null);
    setLens('scenes');
    toast.success(`${draft.name} is ready`, {
      description: `${draft.target.toFixed(1)}°, lights ${draft.lights}% — one press from now on.`,
      action: { label: 'Undo', onClick: () => scenesCol.remove(made.id) },
    });
  };

  const copyScene = (scene: Scene) => {
    const made = scenesCol.create({
      ...draftFrom(scene),
      name: `${scene.name} (yours)`,
      owner: me,
      builtIn: false,
      shared: false,
      uses: 0,
    });
    setLens('scenes');
    toast.success(`Copied ${scene.name}`, {
      description: 'Yours to change however you like.',
      action: { label: 'Undo', onClick: () => scenesCol.remove(made.id) },
    });
  };

  const dropScene = (scene: Scene) => {
    const using = rules.filter((rule) => rule.sceneId === scene.id);
    scenesCol.remove(scene.id);
    using.forEach((rule) => rulesCol.update(rule.id, { active: false }));

    toast.success(`${scene.name} deleted`, {
      description:
        using.length > 0
          ? `${using.length} ${using.length === 1 ? 'rule was' : 'rules were'} using it, so ${using.length === 1 ? 'it has' : 'they have'} been switched off.`
          : 'Nothing was using it.',
      action: {
        label: 'Undo',
        onClick: () => {
          scenesCol.create({ ...scene });
          using.forEach((rule) => rulesCol.update(rule.id, { active: rule.active }));
        },
      },
    });
  };

  const saveRule = (draft: RuleDraft) => {
    const patch = {
      name: draft.name,
      trigger: draft.trigger,
      sceneId: draft.sceneId,
      lead: draft.lead,
      active: draft.active,
      spaceId: draft.spaceId === '' ? undefined : draft.spaceId,
      kind: draft.kind === 'any' ? undefined : (draft.kind as Rule['kind']),
    };

    const editing = ruleDraft?.id;
    if (editing !== undefined) {
      rulesCol.update(editing, patch);
      setRuleDraft(null);
      toast.success(`${draft.name} saved`);
      return;
    }

    const made = rulesCol.create({ ...patch, owner: me, runs: 0 });
    setRuleDraft(null);
    setLens('rules');
    toast.success(`${draft.name} is on`, {
      description: 'It runs on its own from now on.',
      action: { label: 'Undo', onClick: () => rulesCol.remove(made.id) },
    });
  };

  const toggleRule = (rule: Rule) => {
    rulesCol.update(rule.id, { active: !rule.active });
    toast.success(rule.active ? `${rule.name} is off` : `${rule.name} is on`, {
      description: rule.active
        ? 'Nothing will happen on its own until you switch it back.'
        : 'It will run the next time it matches.',
      action: { label: 'Undo', onClick: () => rulesCol.update(rule.id, { active: rule.active }) },
    });
  };

  const dropRule = (rule: Rule) => {
    rulesCol.remove(rule.id);
    toast.success(`${rule.name} deleted`, {
      action: { label: 'Undo', onClick: () => rulesCol.create({ ...rule }) },
    });
  };

  const prepare = (entry: Upcoming) => {
    if (meetingScene === undefined) return;
    if (!entry.canSet) {
      toast.error(`${entry.space.name} is not yours to set yet`, {
        description: standingFor(entry.space.id).reason,
      });
      return;
    }

    const before: Partial<Zone> = {
      target: entry.zone.target,
      mode: entry.zone.mode,
      fan: entry.zone.fan,
    };

    zonesCol.update(entry.zone.id, {
      target: meetingScene.target,
      mode: meetingScene.mode,
      fan: meetingScene.fan,
      setBy: me,
      setAt: new Date().toISOString(),
    });

    setPulling(null);
    setPicked(entry.space.id);
    setLens('space');
    toast.success(`${entry.space.name} is on its way to ${meetingScene.target.toFixed(1)}°`, {
      description: `About ${entry.lead} min, so it will be there before ${entry.meeting.start}.`,
      action: { label: 'Undo', onClick: () => zonesCol.update(entry.zone.id, before) },
    });
  };

  const automate = (entry: Upcoming) => {
    if (meetingScene === undefined) return;
    setRuleDraft({
      draft: {
        ...blankRule(meetingScene.id),
        name: `Get ${entry.space.name} ready before a meeting`,
        spaceId: entry.space.id,
        lead: Math.min(90, Math.max(5, Math.round(entry.lead / 5) * 5)),
      },
    });
  };

  const heading =
    lens === 'space'
      ? (active?.space.name ?? 'Nowhere yet')
      : lens === 'building'
        ? `${visible.length} of ${rows.length} rooms`
        : lens === 'scenes'
          ? `${scenes.length} scenes`
          : `${rules.length} rules`;

  const happening = active ? nowInRoom(meetings, active.space.id, today, clock) : undefined;

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[80rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">Atmosphere · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">The room, exactly how you want it</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              Every room has one climate and one set of controls. Whoever booked it sets it,
              everyone in it gets a say, and the building tells you what that costs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSceneDraft({
                  draft:
                    active && lens === 'space'
                      ? {
                          ...blankScene(),
                          name: '',
                          target: active.zone.target,
                          mode: active.zone.mode,
                          fan: active.zone.fan,
                          lights: active.zone.lights,
                          warmth: active.zone.warmth,
                          blinds: active.zone.blinds,
                          sign: active.zone.sign,
                        }
                      : blankScene(),
                })
              }
              className="dx-btn-secondary"
            >
              <Sparkles size={15} aria-hidden="true" />
              {lens === 'space' ? 'Save this as a scene' : 'New scene'}
            </button>
            <button
              type="button"
              onClick={() =>
                setRuleDraft({ draft: blankRule(meetingScene?.id ?? scenes[0]?.id ?? '') })
              }
              className="dx-btn-primary"
            >
              <Plus size={15} aria-hidden="true" />
              New rule
            </button>
          </div>
        </div>

        <section
          aria-label="The building at a glance"
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
            <section aria-labelledby="atmosphere-heading" className="dx-card overflow-hidden">
              <h3 id="atmosphere-heading" className="sr-only">
                Comfort controls
              </h3>

              <Toolbar
                lenses={LENSES}
                lens={lens}
                onLens={setLens}
                heading={heading}
                filters={filters}
                onFilters={setFilters}
                levels={levels}
                showFilters={lens === 'building'}
              />

              {lens === 'space' &&
                (active === undefined || tally === undefined || standing === undefined ? (
                  <EmptyState
                    icon={SearchX}
                    title="No room is reporting anything yet."
                    actionLabel="Look at the building"
                    onAction={() => setLens('building')}
                  />
                ) : (
                  <div className="px-4 py-5">
                    <ZonePanel
                      space={active.space}
                      zone={active.zone}
                      standing={standing}
                      locked={locked}
                      clock={clock}
                      tally={tally}
                      mine={mine}
                      consensus={consensus}
                      scenes={scenes}
                      happening={happening}
                      onTarget={(target) => {
                        if (locked) {
                          refuse();
                          return;
                        }
                        setPulling(target);
                      }}
                      onCommitTarget={commitTarget}
                      onPatch={(patch) => write(patch, ...announce(patch))}
                      onVote={vote}
                      onNudge={nudge}
                      onScene={applyScene}
                      onReport={() => setReporting(true)}
                    />
                  </div>
                ))}

              {lens === 'building' &&
                (visible.length === 0 ? (
                  <EmptyState
                    icon={SearchX}
                    title="No room matches that."
                    actionLabel="Clear the filters"
                    onAction={() => setFilters(NO_FILTERS)}
                  />
                ) : (
                  <BuildingGrid
                    rows={visible}
                    activeSpaceId={activeId}
                    standingFor={standingFor}
                    votersFor={(spaceId) => tallySize(tallyOf(votes, spaceId))}
                    onOpen={(spaceId) => {
                      setPulling(null);
                      setPicked(spaceId);
                      setLens('space');
                    }}
                  />
                ))}

              {lens === 'scenes' && (
                <SceneList
                  scenes={scenes}
                  zone={active?.zone}
                  space={active?.space}
                  me={me}
                  locked={locked}
                  onApply={applyScene}
                  onEdit={(scene) => setSceneDraft({ draft: draftFrom(scene), id: scene.id })}
                  onCopy={copyScene}
                  onDelete={dropScene}
                />
              )}

              {lens === 'rules' &&
                (rules.length === 0 ? (
                  <EmptyState
                    icon={Wand2}
                    title="Nothing runs on its own yet."
                    actionLabel="Write your first rule"
                    onAction={() =>
                      setRuleDraft({ draft: blankRule(meetingScene?.id ?? scenes[0]?.id ?? '') })
                    }
                  />
                ) : (
                  <RuleList
                    rules={rules}
                    scenes={scenes}
                    spaces={spaces}
                    me={me}
                    onToggle={toggleRule}
                    onEdit={(rule) => setRuleDraft({ draft: draftFromRule(rule), id: rule.id })}
                    onDelete={dropRule}
                  />
                ))}
            </section>

            {lens === 'space' && active && standing && (
              <SignCard
                space={active.space}
                zone={active.zone}
                happening={happening}
                locked={locked}
                onPatch={(patch) => write(patch, 'The sign has changed')}
              />
            )}
          </div>

          <ZoneRail
            upcoming={upcoming}
            spend={buildingCost(zones, spaces)}
            comfortable={comfortable}
            total={rows.length}
            flagged={flagged}
            onPrepare={prepare}
            onAutomate={automate}
            onOpen={(spaceId) => {
              setPulling(null);
              setPicked(spaceId);
              setLens('space');
            }}
          />
        </div>
      </div>

      {reporting && active && (
        <ReportDialog
          space={active.space}
          zone={active.zone}
          alreadySaid={
            consensus.people.length > 0 ? consensus.people.filter((who) => who !== me).length : 0
          }
          suggested={
            comfortOf(active.zone.temp) === 'cold' || comfortOf(active.zone.temp) === 'cool'
              ? 'cold'
              : comfortOf(active.zone.temp) === 'hot' || comfortOf(active.zone.temp) === 'warm'
                ? 'hot'
                : SYMPTOMS[0].id
          }
          onClose={() => setReporting(false)}
          onRaise={raise}
        />
      )}

      {sceneDraft && (
        <SceneDialog
          initial={sceneDraft.draft}
          editingId={sceneDraft.id}
          taken={scenes
            .filter((scene) => scene.id !== sceneDraft.id)
            .map((scene) => scene.name)}
          zone={active?.zone}
          space={active?.space}
          onClose={() => setSceneDraft(null)}
          onSave={saveScene}
        />
      )}

      {ruleDraft && (
        <RuleDialog
          initial={ruleDraft.draft}
          editingId={ruleDraft.id}
          scenes={scenes}
          spaces={spaces}
          onClose={() => setRuleDraft(null)}
          onSave={saveRule}
        />
      )}
    </div>
  );
}
