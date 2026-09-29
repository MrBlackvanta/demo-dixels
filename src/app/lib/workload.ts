import { todayKey } from './format';
import type { Task, TaskPriority, TaskState } from './data';

export const WORK_DAY = 420;

export const STATES: TaskState[] = ['backlog', 'todo', 'doing', 'review', 'done'];

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export const isDone = (task: Task): boolean => task.state === 'done';

export const isLive = (task: Task): boolean => task.state !== 'done';

export const isOverdue = (task: Task): boolean => isLive(task) && task.due < todayKey();

export const isDueToday = (task: Task): boolean => isLive(task) && task.due === todayKey();

export const remainingOf = (task: Task): number => Math.max(0, task.estimate - task.logged);

export const doneChecks = (task: Task): number =>
  task.checklist.filter((step) => step.done).length;

export const openBlockers = (task: Task, all: Task[]): Task[] =>
  task.blockedBy
    .map((id) => all.find((row) => row.id === id))
    .filter((row): row is Task => row !== undefined && isLive(row));

export const waitingOn = (task: Task, all: Task[]): Task[] =>
  all.filter((row) => isLive(row) && row.blockedBy.includes(task.id));

export const needsClearance = (state: TaskState): boolean =>
  STATES.indexOf(state) >= STATES.indexOf('doing');

export const canEnter = (task: Task, state: TaskState, all: Task[]): boolean =>
  !needsClearance(state) || openBlockers(task, all).length === 0;

export const freedBy = (task: Task, all: Task[]): Task[] =>
  waitingOn(task, all).filter((row) => openBlockers(row, all).length === 1);

const countsToday = (task: Task): boolean =>
  task.state === 'doing' || (task.state === 'todo' && task.due <= todayKey());

export const committedFor = (all: Task[], person: string): number =>
  all
    .filter((row) => row.owner === person && countsToday(row))
    .reduce((total, row) => total + remainingOf(row), 0);

export const loadOf = (all: Task[], person: string): number =>
  committedFor(all, person) / WORK_DAY;

export const overloaded = (all: Task[], person: string): boolean =>
  committedFor(all, person) > WORK_DAY;

export const ownersOf = (all: Task[]): string[] => [
  ...new Set(all.filter(isLive).map((row) => row.owner)),
];

export type Health = 'shipped' | 'blocked' | 'at-risk' | 'on-track';

export const tasksOf = (all: Task[], projectId: string): Task[] =>
  all.filter((row) => row.projectId === projectId);

export const healthOf = (all: Task[], projectId: string): Health => {
  const rows = tasksOf(all, projectId);
  if (rows.length > 0 && rows.every(isDone)) return 'shipped';

  const late = rows.filter(isOverdue);
  if (late.some((row) => openBlockers(row, all).length > 0)) return 'blocked';
  if (late.length > 0) return 'at-risk';
  return 'on-track';
};

export const progressOf = (all: Task[], projectId: string): number => {
  const rows = tasksOf(all, projectId);
  const total = rows.reduce((sum, row) => sum + row.estimate, 0);
  if (total === 0) return 0;

  const banked = rows.reduce(
    (sum, row) => sum + (isDone(row) ? row.estimate : Math.min(row.logged, row.estimate)),
    0,
  );
  return Math.round((banked / total) * 100);
};

const entry = (body: string, at: string) => ({
  author: 'TaskFlow',
  body,
  at,
  kind: 'event' as const,
});

export const STATE_NAME: Record<TaskState, string> = {
  backlog: 'Backlog',
  todo: 'To do',
  doing: 'Doing',
  review: 'In review',
  done: 'Done',
};

export const moveTo = (task: Task, state: TaskState, who: string): Partial<Task> => {
  const at = new Date().toISOString();

  return {
    state,
    startedAt: state === 'doing' && !task.startedAt ? at : task.startedAt,
    doneAt: state === 'done' ? at : undefined,
    thread: [...task.thread, entry(`${who} moved it to ${STATE_NAME[state]}`, at)],
  };
};

export const logWork = (task: Task, minutes: number, who: string): Partial<Task> => {
  const at = new Date().toISOString();

  return {
    logged: task.logged + minutes,
    thread: [...task.thread, entry(`${who} logged ${minutes} minutes`, at)],
  };
};

export const tickCheck = (task: Task, position: number): Partial<Task> => ({
  checklist: task.checklist.map((step, index) =>
    index === position ? { ...step, done: !step.done } : step,
  ),
});

export const handOver = (task: Task, to: string, team: string, who: string): Partial<Task> => {
  const at = new Date().toISOString();

  return {
    owner: to,
    team,
    thread: [...task.thread, entry(`${who} passed it to ${to}`, at)],
  };
};

export const withNote = (task: Task, author: string, body: string): Partial<Task> => ({
  thread: [...task.thread, { author, body, at: new Date().toISOString(), kind: 'note' as const }],
});
