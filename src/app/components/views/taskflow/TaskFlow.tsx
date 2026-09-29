import { useMemo, useState } from 'react';
import { FolderKanban, Gauge, KanbanSquare, Plus, SearchX, UserRound } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';
import { CountUp } from '../../shell/CountUp';
import { EmptyState } from '../../shell/EmptyState';
import { useCollection } from '../../../lib/store';
import { CURRENT_USER, projects as projectsCol, tasks as tasksCol } from '../../../lib/data';
import { PEOPLE } from '../../../lib/seed';
import { duration } from '../../../lib/format';
import {
  WORK_DAY,
  canEnter,
  committedFor,
  freedBy,
  handOver,
  isDueToday,
  isLive,
  isOverdue,
  logWork,
  moveTo,
  openBlockers,
  ownersOf,
  tickCheck,
  withNote,
} from '../../../lib/workload';
import type { Task, TaskState } from '../../../lib/data';
import { Board } from './Board';
import { MyWork } from './MyWork';
import { NewTaskDialog } from './NewTaskDialog';
import type { Draft } from './NewTaskDialog';
import { Portfolio } from './Portfolio';
import { TaskSheet } from './TaskSheet';
import { TeamLoad } from './TeamLoad';
import { Toolbar } from './Toolbar';
import type { Lens } from './Toolbar';
import { NO_FILTERS, STATE_LABEL, byUrgency, matchesFilters } from './plan';
import type { Filters } from './plan';

const me = CURRENT_USER.name;

const teamFor = (person: string): string =>
  PEOPLE.find((row) => row.name === person)?.team ?? 'Workplace';

export function TaskFlow() {
  const all = useCollection(tasksCol);
  const projects = useCollection(projectsCol);

  const [lens, setLens] = useState('board');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const open = openId === null ? undefined : all.find((task) => task.id === openId);

  const mine = useMemo(() => all.filter((task) => task.owner === me && isLive(task)), [all]);
  const late = useMemo(() => all.filter(isOverdue), [all]);
  const stuck = useMemo(
    () => all.filter((task) => isLive(task) && openBlockers(task, all).length > 0),
    [all],
  );
  const strained = useMemo(
    () => ownersOf(all).filter((person) => committedFor(all, person) > WORK_DAY),
    [all],
  );
  const people = useMemo(() => ownersOf(all).sort((a, b) => a.localeCompare(b)), [all]);

  const shown = useMemo(
    () => all.filter((task) => matchesFilters(task, filters, all)),
    [all, filters],
  );

  const lenses: Lens[] = [
    { id: 'board', label: 'Board', icon: KanbanSquare },
    { id: 'mine', label: 'My work', icon: UserRound, count: mine.length },
    { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
    { id: 'load', label: 'Team load', icon: Gauge, count: strained.length },
  ];

  const stats = [
    { label: 'Yours to do', value: mine.length, tone: 'brand' as const },
    { label: 'Due today', value: all.filter(isDueToday).length, tone: 'neutral' as const },
    { label: 'Stuck behind something', value: stuck.length, tone: 'warning' as const },
    { label: 'Over a full day', value: strained.length, tone: 'warning' as const },
  ];

  const move = (task: Task, state: TaskState) => {
    if (!canEnter(task, state, all)) {
      const blockers = openBlockers(task, all);
      toast.error(`${task.ref} cannot move yet`, {
        description:
          blockers.length === 1
            ? `${blockers[0].title} has to be done first — that one is with ${blockers[0].owner}.`
            : `${blockers.length} other tasks have to be done first.`,
      });
      return;
    }

    const before = {
      state: task.state,
      startedAt: task.startedAt,
      doneAt: task.doneAt,
      thread: task.thread,
    };
    const freed = state === 'done' ? freedBy(task, all) : [];
    const projected = all.map((row) => (row.id === task.id ? { ...row, state } : row));
    const load = committedFor(projected, task.owner);

    tasksCol.update(task.id, moveTo(task, state, me));

    const description =
      freed.length > 0
        ? freed.length === 1
          ? `That frees up ${freed[0].title} for ${freed[0].owner}.`
          : `That frees up ${freed.length} tasks that were waiting on it.`
        : load > WORK_DAY && state === 'doing'
          ? `${task.owner === me ? 'You are' : `${task.owner} is`} now at ${duration(load)} against a ${duration(WORK_DAY)} day.`
          : task.title;

    toast.success(`${task.ref} moved to ${STATE_LABEL[state]}`, {
      description,
      action: { label: 'Undo', onClick: () => tasksCol.update(task.id, before) },
    });
  };

  const log = (task: Task, minutes: number) => {
    const before = { logged: task.logged, thread: task.thread };
    tasksCol.update(task.id, logWork(task, minutes, me));
    toast.success(`${duration(minutes)} on ${task.ref}`, {
      description: `${duration(task.logged + minutes)} of ${duration(task.estimate)} used.`,
      action: { label: 'Undo', onClick: () => tasksCol.update(task.id, before) },
    });
  };

  const tick = (task: Task, position: number) => {
    tasksCol.update(task.id, tickCheck(task, position));
  };

  const note = (task: Task, body: string) => {
    tasksCol.update(task.id, withNote(task, me, body));
    toast.success(`Added to ${task.ref}`);
  };

  const pass = (task: Task, to: string) => {
    const before = { owner: task.owner, team: task.team, thread: task.thread };
    const projected = all.map((row) => (row.id === task.id ? { ...row, owner: to } : row));
    const load = committedFor(projected, to);

    tasksCol.update(task.id, handOver(task, to, teamFor(to), me));
    toast.success(`${task.ref} is now with ${to}`, {
      description:
        load > WORK_DAY
          ? `That puts them at ${duration(load)} against a ${duration(WORK_DAY)} day.`
          : `Their day is ${duration(load)} of ${duration(WORK_DAY)}.`,
      action: { label: 'Undo', onClick: () => tasksCol.update(task.id, before) },
    });
  };

  const create = (draft: Draft) => {
    const highest = all.reduce((top, row) => Math.max(top, Number(row.ref.slice(3)) || 0), 319);
    const project = projects.find((row) => row.id === draft.projectId);
    const blocker = draft.blockedBy[0]
      ? all.find((row) => row.id === draft.blockedBy[0])
      : undefined;
    const raisedAt = new Date().toISOString();

    const created = tasksCol.create({
      ref: `TF-${highest + 1}`,
      title: draft.title,
      detail: draft.detail || 'No detail yet.',
      projectId: draft.projectId,
      state: blocker ? 'backlog' : 'todo',
      priority: draft.priority,
      owner: draft.owner,
      team: teamFor(draft.owner),
      estimate: draft.estimate,
      logged: 0,
      due: draft.due,
      raisedAt,
      blockedBy: draft.blockedBy,
      checklist: [],
      tags: [],
      thread: [
        {
          author: 'TaskFlow',
          body: `${me} added it to ${project?.name ?? 'the board'}`,
          at: raisedAt,
          kind: 'event',
        },
      ],
    });

    setAdding(false);
    setLens('board');
    toast.success(`${created.ref} is on the board`, {
      description: blocker
        ? `It waits in Backlog until ${blocker.ref} is done.`
        : `${draft.owner === me ? 'It is yours' : `${draft.owner} has it`} — ${duration(draft.estimate)} of work.`,
      action: { label: 'Undo', onClick: () => tasksCol.remove(created.id) },
    });
  };

  return (
    <div className="relative">
      <div
        className="dx-wash-soft pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[76rem] px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dx-eyebrow mb-2">TaskFlow · {CURRENT_USER.building}</p>
            <h2 className="dx-h2 text-balance">What everyone is actually working on</h2>
            <p className="mt-2 max-w-2xl text-body-lg text-ink-muted">
              Work that knows what it is waiting on, and a day that knows how much it can hold.
            </p>
          </div>

          <button type="button" onClick={() => setAdding(true)} className="dx-btn-primary">
            <Plus size={15} aria-hidden="true" />
            Add a task
          </button>
        </div>

        <section aria-label="The work at a glance" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
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

        <section aria-labelledby="taskflow-heading" className="dx-card overflow-hidden">
          <h3 id="taskflow-heading" className="sr-only">
            The board and your work
          </h3>

          <Toolbar
            lenses={lenses}
            lens={lens}
            onLens={setLens}
            filters={filters}
            onFilters={setFilters}
            projects={projects}
            people={people}
            searchLabel={lens === 'projects' ? 'Search projects' : 'Search the work'}
            withFilters={lens === 'board'}
          />

          {lens === 'board' &&
            (shown.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nothing on the board matches that."
                actionLabel="Clear the filters"
                onAction={() => setFilters(NO_FILTERS)}
              />
            ) : (
              <Board
                tasks={shown}
                all={all}
                projects={projects}
                sort={byUrgency}
                onOpen={(task) => setOpenId(task.id)}
                onMove={move}
              />
            ))}

          {lens === 'mine' &&
            (mine.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nothing is on your plate."
                actionLabel="Look at the board"
                onAction={() => setLens('board')}
              />
            ) : (
              <MyWork all={all} projects={projects} me={me} onOpen={(task) => setOpenId(task.id)} />
            ))}

          {lens === 'projects' && (
            <Portfolio
              projects={projects.filter((project) =>
                `${project.key} ${project.name} ${project.summary} ${project.lead}`
                  .toLowerCase()
                  .includes(filters.search.trim().toLowerCase()),
              )}
              all={all}
              onPick={(projectId) => {
                setFilters({ ...NO_FILTERS, projectId });
                setLens('board');
              }}
            />
          )}

          {lens === 'load' && (
            <TeamLoad
              all={all}
              me={me}
              onPick={(owner) => {
                setFilters({ ...NO_FILTERS, owner });
                setLens('board');
              }}
            />
          )}
        </section>

        {late.length > 0 && (
          <p className="mt-4 text-center text-[0.75rem] text-ink-muted">
            {late.length} {late.length === 1 ? 'task is' : 'tasks are'} past their due date, and{' '}
            {stuck.length} {stuck.length === 1 ? 'is' : 'are'} waiting on somebody else.
          </p>
        )}
      </div>

      {open && (
        <TaskSheet
          task={open}
          all={all}
          project={projects.find((row) => row.id === open.projectId)}
          me={me}
          onClose={() => setOpenId(null)}
          onNote={note}
          onMove={move}
          onLog={log}
          onTick={tick}
          onHandOver={pass}
          onOpen={(task) => setOpenId(task.id)}
        />
      )}

      {adding && (
        <NewTaskDialog
          projects={projects}
          all={all}
          me={me}
          onClose={() => setAdding(false)}
          onCreate={create}
        />
      )}
    </div>
  );
}
