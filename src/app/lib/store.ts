import { useCallback, useSyncExternalStore } from 'react';

const NAMESPACE = 'dixels.v1';

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const snapshots = new Map<string, unknown[]>();

const keyFor = (collection: string) => `${NAMESPACE}.${collection}`;

function readRaw<T>(collection: string): T[] {
  try {
    const raw = localStorage.getItem(keyFor(collection));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore compares snapshots by identity, so the cached array must
// survive until a write actually changes it or the subscription loops forever.
function snapshot<T>(collection: string): T[] {
  if (!snapshots.has(collection)) snapshots.set(collection, readRaw<T>(collection));
  return snapshots.get(collection) as T[];
}

function commit<T>(collection: string, next: T[]): void {
  snapshots.set(collection, next);
  try {
    localStorage.setItem(keyFor(collection), JSON.stringify(next));
  } catch {
    /* quota or private mode — the in-memory snapshot still drives the UI */
  }
  listeners.get(collection)?.forEach((fn) => fn());
}

function subscribe(collection: string, listener: Listener): () => void {
  if (!listeners.has(collection)) listeners.set(collection, new Set());
  listeners.get(collection)!.add(listener);
  return () => listeners.get(collection)!.delete(listener);
}

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function collection<T extends Entity>(name: string) {
  const all = (): T[] => snapshot<T>(name);

  const create = (input: Omit<T, keyof Entity> & Partial<Entity>): T => {
    const now = new Date().toISOString();
    const record = { ...input, id: input.id ?? newId(), createdAt: now, updatedAt: now } as T;
    commit(name, [record, ...all()]);
    return record;
  };

  const update = (id: string, patch: Partial<Omit<T, keyof Entity>>): T | undefined => {
    let updated: T | undefined;
    const next = all().map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) commit(name, next);
    return updated;
  };

  const remove = (id: string): void => {
    const next = all().filter((row) => row.id !== id);
    if (next.length !== all().length) commit(name, next);
  };

  const replaceAll = (rows: T[]): void => commit(name, rows);

  const find = (id: string): T | undefined => all().find((row) => row.id === id);

  return { name, all, find, create, update, remove, replaceAll };
}

export type Collection<T extends Entity> = ReturnType<typeof collection<T>>;

export function useCollection<T extends Entity>(col: Collection<T>): T[] {
  return useSyncExternalStore(
    useCallback((listener: Listener) => subscribe(col.name, listener), [col.name]),
    () => col.all(),
    () => col.all(),
  );
}

export function scalar<T>(name: string, fallback: T) {
  const read = (): T => {
    if (!snapshots.has(name)) {
      let value = fallback;
      try {
        const raw = localStorage.getItem(keyFor(name));
        if (raw) value = JSON.parse(raw) as T;
      } catch {
        /* fall through to the default */
      }
      snapshots.set(name, [value]);
    }
    return (snapshots.get(name) as T[])[0];
  };
  const write = (value: T): void => {
    snapshots.set(name, [value]);
    try {
      localStorage.setItem(keyFor(name), JSON.stringify(value));
    } catch {
      /* ignore */
    }
    listeners.get(name)?.forEach((fn) => fn());
  };
  return { name, read, write };
}

export type Scalar<T> = ReturnType<typeof scalar<T>>;

export function useScalar<T>(box: Scalar<T>): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    useCallback((listener: Listener) => subscribe(box.name, listener), [box.name]),
    () => box.read(),
    () => box.read(),
  );
  return [value, box.write];
}

const SEED_VERSION = 'v23';
const SEED_STAMP = `${NAMESPACE}.seeded.${SEED_VERSION}`;

export function seedOnce(collections: Array<{ col: Collection<never>; rows: unknown[] }>): void {
  if (localStorage.getItem(SEED_STAMP)) return;
  collections.forEach(({ col, rows }) => col.replaceAll(rows as never[]));
  try {
    localStorage.setItem(SEED_STAMP, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function resetDemo(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(NAMESPACE))
    .forEach((k) => localStorage.removeItem(k));
  snapshots.clear();
  listeners.forEach((set) => set.forEach((fn) => fn()));
}
