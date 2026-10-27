const ROSTER_KEY = 'ba-sensei-box:roster:v1'
const META_KEY = 'ba-sensei-box:meta:v1'

export interface RosterMeta {
  target: string
  level: number | null
  notes: string
}

export const EMPTY_META: RosterMeta = {
  target: '',
  level: null,
  notes: '',
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private mode or a locked-down file:// context: the app still works in-memory.
  }
}

export function loadSelectedIds(): number[] {
  const raw = readStorage(ROSTER_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is number => Number.isInteger(value))
  } catch {
    return []
  }
}

export function saveSelectedIds(ids: ReadonlySet<number>): void {
  writeStorage(ROSTER_KEY, JSON.stringify([...ids].toSorted((left, right) => left - right)))
}

export function loadRosterMeta(): RosterMeta {
  const raw = readStorage(META_KEY)
  if (!raw) return EMPTY_META
  try {
    const parsed = JSON.parse(raw) as Partial<RosterMeta>
    return {
      target: typeof parsed.target === 'string' ? parsed.target : '',
      level: typeof parsed.level === 'number' ? parsed.level : null,
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    }
  } catch {
    return EMPTY_META
  }
}

export function saveRosterMeta(meta: RosterMeta): void {
  writeStorage(META_KEY, JSON.stringify(meta))
}
